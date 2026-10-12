// tuner.js — accordatore cromatico (Web Audio API + rilevamento pitch dal microfono)
// Zero dipendenze. Espone window.ChordTuner.
//   ChordTuner.start(onUpdate, onError) -> avvia il microfono e il rilevamento continuo.
//     onUpdate({ freq, note, pc, octave, cents, clarity }) ad ogni frame rilevato,
//     onUpdate(null) quando non c'è segnale/pitch chiaro abbastanza.
//   ChordTuner.stop()  -> ferma microfono e rilevamento.
//   ChordTuner.isRunning() -> bool
(function () {
  'use strict';

  var ctx = null, analyser = null, stream = null, source = null;
  var buf = null;
  var tickTimer = null;
  var running = false;
  var wantRunning = false;   // intento: true tra start() e stop(), anche mentre il permesso è in sospeso
  var TICK_MS = 55;          // ~18 aggiornamenti/sec: fluido per l'occhio, molto più leggero per la CPU

  function ensureCtx() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Autocorrelazione nel dominio del tempo: trova il periodo fondamentale del
  // segnale e lo converte in frequenza. Ritorna { freq, clarity } o null se il
  // segnale è troppo debole o non abbastanza periodico da fidarsi.
  var MIN_FREQ = 38;   // sotto il Mi grave del basso a 4 corde (E1 ≈ 41.2 Hz)
  var MAX_FREQ = 1500;

  function detectPitch(samples, sampleRate) {
    var SIZE = samples.length;
    var rms = 0;
    for (var i = 0; i < SIZE; i++) rms += samples[i] * samples[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return null; // silenzio / rumore di fondo

    var WINDOW = Math.floor(SIZE / 2);
    function corrAt(lag) {
      var sum = 0;
      for (var j = 0; j < WINDOW; j++) sum += samples[j] * samples[j + lag];
      return sum;
    }
    var corr0 = corrAt(0);
    if (corr0 <= 0) return null;

    // Si cerca solo nell'intervallo di lag che corrisponde alle frequenze che
    // interessano (55-1500 Hz). Escludere i lag brevissimi (vicino a 0) non è
    // solo inutile: a quei lag la correlazione resta quasi identica a corr0
    // per via di rumore in virgola mobile (specialmente per segnali di
    // frequenza bassa, dove campioni adiacenti sono quasi uguali), il che
    // confonderebbe la ricerca del "primo periodo reale".
    var minLag = Math.max(1, Math.floor(sampleRate / MAX_FREQ));
    var maxLag = Math.min(WINDOW - 1, Math.ceil(sampleRate / MIN_FREQ));

    // Si cerca il PRIMO picco di correlazione chiaramente in risalita, non il
    // massimo assoluto sull'intero intervallo: subito dopo lag=0 la
    // correlazione normalizzata scende col procedere del lag (fase della
    // sinusoide che si allontana) e resta comunque relativamente alta per un
    // bel tratto prima del vero periodo — una soglia bassa o un semplice "è
    // appena diminuita" scatterebbero durante questa discesa iniziale, ben
    // prima del periodo reale. Si arma solo quando la correlazione normalizzata
    // supera 0.9 ED è in salita rispetto al campione precedente (siamo quindi
    // oltre il minimo, in risalita verso il vero picco periodico); non appena
    // ridiscende dopo essere stata armata, il picco appena superato è quello buono.
    var lastNorm = 1, armed = false;
    var bestLag = -1, bestVal = -Infinity;
    for (var lag = minLag; lag <= maxLag; lag++) {
      var v = corrAt(lag);
      var norm = v / corr0;
      if (norm > 0.9 && norm > lastNorm) {
        armed = true;
        if (v > bestVal) { bestVal = v; bestLag = lag; }
      } else if (armed) {
        break; // la correlazione, dopo essere salita oltre la soglia, ha iniziato a scendere
      }
      lastNorm = norm;
    }
    if (bestLag <= 0) return null;

    var clarity = bestVal / corr0;
    if (clarity < 0.5) return null;

    // Interpolazione parabolica intorno al picco per una stima sub-campione.
    var y0 = corrAt(bestLag - 1), y1 = bestVal, y2 = corrAt(bestLag + 1);
    var denom = (y0 - 2 * y1 + y2);
    var shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
    var lagEst = bestLag + shift;
    if (lagEst <= 0) return null;

    var freq = sampleRate / lagEst;
    if (freq < MIN_FREQ || freq > MAX_FREQ) return null;
    return { freq: freq, clarity: Math.max(0, Math.min(1, clarity)) };
  }

  function freqToNote(freq) {
    var midi = 69 + 12 * Math.log(freq / 440) / Math.LN2;
    var rounded = Math.round(midi);
    var cents = Math.round((midi - rounded) * 100);
    var pc = ((rounded % 12) + 12) % 12;
    var octave = Math.floor(rounded / 12) - 1;
    return { pc: pc, octave: octave, cents: cents, midi: rounded };
  }

  // Throttle a ~TICK_MS invece di requestAnimationFrame: il rilevamento pitch
  // è pesante (autocorrelazione), farlo a 60-120 volte/sec come un rAF grezzo
  // può saturare il thread principale su molti dispositivi e dare l'impressione
  // che l'interfaccia (incluso il pulsante "Chiudi") sia bloccata.
  function tick(onUpdate) {
    if (!running) return;
    analyser.getFloatTimeDomainData(buf);
    var r = detectPitch(buf, ctx.sampleRate);
    if (!r) {
      onUpdate(null);
    } else {
      var n = freqToNote(r.freq);
      onUpdate({ freq: r.freq, note: n.midi, pc: n.pc, octave: n.octave, cents: n.cents, clarity: r.clarity });
    }
    tickTimer = setTimeout(function () { tick(onUpdate); }, TICK_MS);
  }

  function start(onUpdate, onError) {
    if (running || wantRunning) return;
    wantRunning = true;
    var c = ensureCtx();
    if (!c || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      wantRunning = false;
      if (onError) onError(new Error('Web Audio / microfono non supportati da questo browser.'));
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
        // stop() può essere stato chiamato (es. chiusura pannello) mentre il
        // permesso era ancora in sospeso: in tal caso non riattivare nulla,
        // rilascia subito lo stream appena ottenuto.
        if (!wantRunning) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        stream = s;
        source = c.createMediaStreamSource(stream);
        analyser = c.createAnalyser();
        analyser.fftSize = 2048;
        buf = new Float32Array(analyser.fftSize);
        source.connect(analyser);
        running = true;
        tick(onUpdate);
      })
      .catch(function (err) {
        wantRunning = false;
        if (onError) onError(err);
      });
  }

  function stop() {
    wantRunning = false;
    running = false;
    if (tickTimer) { clearTimeout(tickTimer); tickTimer = null; }
    if (source) { try { source.disconnect(); } catch (e) {} source = null; }
    if (analyser) { try { analyser.disconnect(); } catch (e) {} analyser = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
  }

  function isRunning() { return running; }

  window.ChordTuner = { start: start, stop: stop, isRunning: isRunning };
})();
