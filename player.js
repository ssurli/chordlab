// player.js — semplice player audio (Web Audio API, zero dipendenze)
// Riproduce una sequenza di eventi-accordo sintetizzandoli con oscillatori.
// Espone window.ChordPlayer.
//   ChordPlayer.play(events, opts)  events: [{ pcs:[int...], bass:int|null }]
//      opts: { bpm:90, beatsPerEvent:?, onStep(i), onEnd(), metronome:false }
//      Se l'evento ha { beats:n } usa quella durata, altrimenti beatsPerEvent.
//   ChordPlayer.stop()
//   ChordPlayer.isPlaying() -> bool
(function () {
  'use strict';

  var ctx = null, master = null;
  var timers = [];          // setTimeout in coda (per onStep e stop)
  var nodes = [];           // oscillatori/gain attivi (per stop immediato)
  var playing = false;
  var endTimer = null;

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // Voicing semplice: chord-tone vicini all'ottava 4, basso un'ottava sotto.
  // pcs sono pitch-class 0..11. Manteniamo l'ordine "salendo" dalla prima nota.
  function voicing(ev) {
    var out = [];
    var prev = -1;
    (ev.pcs || []).forEach(function (pc) {
      var m = 60 + pc;                 // C4 = 60
      while (m <= prev) m += 12;       // impila salendo per un voicing morbido
      prev = m;
      out.push(m);
    });
    if (ev.bass != null) out.unshift(48 + ev.bass); // basso in ottava 3
    return out;
  }

  // Suona un accordo (block chord) da t0 per dur secondi.
  function strike(midis, t0, dur, vol) {
    var peak = (vol == null ? 0.16 : vol);
    midis.forEach(function (m) {
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = midiToFreq(m);
      var a = 0.012, rel = Math.min(0.18, dur * 0.4);
      var sustainEnd = t0 + Math.max(0.05, dur - rel);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(peak, t0 + a);
      g.gain.setValueAtTime(peak, sustainEnd);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
      nodes.push(osc, g);
    });
  }

  // Click metronomo (breve impulso).
  function click(t0, accent) {
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = accent ? 1600 : 1100;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(accent ? 0.10 : 0.06, t0 + 0.001);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + 0.06);
    nodes.push(osc, g);
  }

  function clearTimers() {
    timers.forEach(clearTimeout); timers = [];
    if (endTimer) { clearTimeout(endTimer); endTimer = null; }
  }

  function stop() {
    playing = false;
    clearTimers();
    nodes.forEach(function (n) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
    nodes = [];
    if (ctx) { try { master.disconnect(); } catch (e) {} master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination); }
  }

  function isPlaying() { return playing; }

  function play(events, opts) {
    opts = opts || {};
    if (!ensureCtx()) { if (opts.onUnsupported) opts.onUnsupported(); return; }
    stop();
    if (!events || !events.length) return;
    playing = true;

    var bpm = Math.max(30, Math.min(280, opts.bpm || 90));
    var spb = 60 / bpm;                              // secondi per beat
    var bpe = opts.beatsPerEvent || 4;              // default: 1 misura 4/4 per evento
    var lead = 0.08;
    var t = ctx.currentTime + lead;
    var startWall = Date.now();
    var startAudio = t;

    events.forEach(function (ev, i) {
      var beats = (ev.beats != null ? ev.beats : bpe);
      var dur = beats * spb;
      var midis = voicing(ev);
      if (midis.length) strike(midis, t, Math.max(0.12, dur * 0.98));
      if (opts.metronome) {
        for (var b = 0; b < Math.round(beats); b++) click(t + b * spb, b === 0);
      }
      // onStep allineato al tempo audio, via setTimeout sul wall-clock.
      (function (idx, when) {
        var delayMs = (when - startAudio) * 1000 + lead * 1000;
        timers.push(setTimeout(function () { if (playing && opts.onStep) opts.onStep(idx); }, Math.max(0, delayMs)));
      })(i, t);
      t += dur;
    });

    var totalMs = (t - startAudio) * 1000 + 120;
    endTimer = setTimeout(function () {
      playing = false;
      if (opts.onEnd) opts.onEnd();
    }, totalMs);
  }

  window.ChordPlayer = { play: play, stop: stop, isPlaying: isPlaying };
})();
