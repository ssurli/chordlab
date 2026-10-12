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
  var raf = null;
  var running = false;

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
  function detectPitch(samples, sampleRate) {
    var SIZE = samples.length;
    var rms = 0;
    for (var i = 0; i < SIZE; i++) rms += samples[i] * samples[i];
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.01) return null; // silenzio / rumore di fondo

    var MAX_LAG = Math.floor(SIZE / 2);
    var corr = new Float32Array(MAX_LAG);
    for (var lag = 0; lag < MAX_LAG; lag++) {
      var sum = 0;
      for (var j = 0; j < MAX_LAG; j++) sum += samples[j] * samples[j + lag];
      corr[lag] = sum;
    }
    // Il primo minimo dopo lag 0 separa il picco "lag=0" dal primo picco reale.
    var d = 0;
    while (d < MAX_LAG - 1 && corr[d] > corr[d + 1]) d++;
    var bestLag = -1, bestVal = -Infinity;
    for (var k = d; k < MAX_LAG; k++) {
      if (corr[k] > bestVal) { bestVal = corr[k]; bestLag = k; }
    }
    if (bestLag <= 0) return null;

    // Interpolazione parabolica intorno al picco per una stima sub-campione.
    var x0 = bestLag < 1 ? bestLag : bestLag - 1;
    var x2 = bestLag + 1 < MAX_LAG ? bestLag + 1 : bestLag;
    var y0 = corr[x0], y1 = corr[bestLag], y2 = corr[x2];
    var denom = (y0 - 2 * y1 + y2);
    var shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
    var lag = bestLag + shift;
    if (lag <= 0) return null;

    var freq = sampleRate / lag;
    var clarity = corr[0] > 0 ? Math.max(0, Math.min(1, bestVal / corr[0])) : 0;
    if (clarity < 0.5 || freq < 60 || freq > 1500) return null;
    return { freq: freq, clarity: clarity };
  }

  function freqToNote(freq) {
    var midi = 69 + 12 * Math.log(freq / 440) / Math.LN2;
    var rounded = Math.round(midi);
    var cents = Math.round((midi - rounded) * 100);
    var pc = ((rounded % 12) + 12) % 12;
    var octave = Math.floor(rounded / 12) - 1;
    return { pc: pc, octave: octave, cents: cents, midi: rounded };
  }

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
    raf = requestAnimationFrame(function () { tick(onUpdate); });
  }

  function start(onUpdate, onError) {
    if (running) return;
    var c = ensureCtx();
    if (!c || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError(new Error('Web Audio / microfono non supportati da questo browser.'));
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
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
        if (onError) onError(err);
      });
  }

  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    if (source) { try { source.disconnect(); } catch (e) {} source = null; }
    if (analyser) { try { analyser.disconnect(); } catch (e) {} analyser = null; }
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
  }

  function isRunning() { return running; }

  window.ChordTuner = { start: start, stop: stop, isRunning: isRunning };
})();
