// ireal.js — import di brani e playlist di iReal Pro (zero dipendenze)
// Legge i link irealb:// e irealbook:// (incollati o dentro il file HTML che iReal
// Pro esporta per le playlist) e li converte nel modello ChordLab: sezioni di misure.
// Espone window.IrealImport = { looksLikeIreal(text), parse(text) -> { name, songs } }.
//
// Formato: il link è percent-encoded; i brani sono separati da "===", i campi da "=":
//   Titolo=Compositore=?=Stile=Tonalità=Trasposizione=Musica=StileComp=BPM=Ripetizioni
// La musica (irealb) inizia con "1r34LbKcu7" ed è rimescolata a blocchi di 50
// caratteri. La logica di de-offuscamento segue ireal-reader (MIT, pianosnake),
// a sua volta basato su accompaniser (ironss).
(function () {
  'use strict';

  var MUSIC_PREFIX = '1r34LbKcu7';
  var LINK_RE = /irealb(?:ook)?:\/\/[^"'\s<>]+/g;

  // ── de-offuscamento ────────────────────────────────────────────────────────
  // ogni blocco di 50 caratteri ha i primi 5 scambiati con gli ultimi 5 e i
  // caratteri 10..23 scambiati con 26..39; l'ultimo blocco (<52) resta com'è.
  function obfusc50(s) {
    var a = s.split(''), i;
    for (i = 0; i < 5; i++) { a[49 - i] = s[i]; a[i] = s[49 - i]; }
    for (i = 10; i < 24; i++) { a[49 - i] = s[i]; a[i] = s[49 - i]; }
    return a.join('');
  }
  function unscramble(s) {
    var r = '', p;
    while (s.length > 50) {
      p = s.substring(0, 50);
      s = s.substring(50);
      r += s.length < 2 ? p : obfusc50(p);
    }
    return r + s;
  }

  // ── accordi: notazione iReal → notazione ChordEngine ──────────────────────
  // iReal: ^ = maj7, - = minore, h = semidiminuito, o = diminuito, + = aumentato
  var QUALITY = [
    [/^-\^7?/, 'mmaj7'], [/^\^9/, 'maj9'], [/^\^13/, 'maj13'], [/^\^7?/, 'maj7'],
    [/^-/, 'm'], [/^h7?/, 'm7b5'], [/^o7/, 'dim7'], [/^o/, 'dim'], [/^\+/, 'aug']
  ];
  function convertChord(tok) {
    var m = /^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/.exec(tok);
    if (!m) return null;
    var root = m[1], q = m[2], bass = m[3];
    for (var i = 0; i < QUALITY.length; i++) {
      var r = QUALITY[i][0].exec(q);
      if (r) { q = QUALITY[i][1] + q.slice(r[0].length); break; }
    }
    q = q.replace(/^7sus$/, '7sus4').replace(/^sus$/, 'sus4').replace(/^2$/, 'add9');
    return root + q + (bass ? '/' + bass : '');
  }

  function keyName(k) {
    if (!k) return '';
    var m = /^([A-G][#b]?)(-)?/.exec(k);
    return m ? m[1] + (m[2] ? 'm' : '') : '';
  }
  function meterName(t) {
    var map = { '44': '4/4', '34': '3/4', '24': '2/4', '54': '5/4', '64': '6/4', '74': '7/4',
                '68': '6/8', '78': '7/8', '98': '9/8', '12': '12/8', '22': '2/2', '32': '3/2' };
    return map[t] || '4/4';
  }
  var SECTION_NAME = { i: 'Intro', v: 'Verse' };

  // ── musica → sezioni di misure ────────────────────────────────────────────
  // Le ripetizioni { } con finali N1/N2 vengono scritte per esteso, così la
  // griglia e il player di ChordLab suonano il brano nell'ordine giusto.
  // D.C./D.S./Coda non vengono espansi: la griglia mostra il percorso scritto una volta.
  function parseMusic(raw) {
    var sections = [], cur = null, bar = null, lastRoot = null;
    var meter = null, pendingMeter = null, notes = [];
    var repStart = null, ending = 0, endingStart = null;
    var lastBars = function () { return cur ? cur.bars : []; };

    function newSection(name) {
      // "{*A": la ripetizione aperta subito prima del marcatore vale per la nuova sezione
      var carry = repStart !== null && (!cur || cur.bars.length === repStart);
      cur = { name: name, bars: [] };
      sections.push(cur);
      bar = null; repStart = carry ? 0 : null; ending = 0;
    }
    function ensureSection() { if (!cur) newSection('A'); }
    function closeBar() {
      if (bar && bar.length) {
        ensureSection();
        cur.bars.push((pendingMeter ? pendingMeter + ' ' : '') + bar.join(' '));
        pendingMeter = null;
      }
      bar = [];
    }
    function pushChord(c) { ensureSection(); if (!bar) bar = []; bar.push(c); }
    function repeatBars(n) {
      closeBar();
      var b = lastBars();
      for (var k = 0; k < n && b.length >= n; k++) b.push(b[b.length - n].replace(/^\d+\/\d+ /, ''));
    }

    var s = raw, m;
    while (s.length) {
      if ((m = /^\*(\w)/.exec(s))) {
        closeBar();
        var id = m[1];
        newSection(SECTION_NAME[id] || id.toUpperCase());
      } else if ((m = /^T(\d{2})/.exec(s))) {
        var mt = meterName(m[1]);
        if (!meter) meter = mt; else if (mt !== meter) { pendingMeter = mt; meter = mt; }
      } else if ((m = /^<([^>]*)>/.exec(s))) {
        var c = m[1].trim();
        if (c) notes.push(c);
      } else if ((m = /^\([^)]*\)/.exec(s))) {
        // accordi alternativi tra parentesi: non li mettiamo nella griglia
      } else if ((m = /^N(\d)/.exec(s))) {
        closeBar();
        ending = +m[1];
        if (ending === 1) endingStart = lastBars().length;
      } else if ((m = /^\{/.exec(s))) {
        closeBar();
        repStart = lastBars().length; ending = 0; endingStart = null;
      } else if ((m = /^\}/.exec(s))) {
        closeBar();
        if (repStart !== null) {
          var b = lastBars();
          var stop = ending === 1 && endingStart !== null ? endingStart : b.length;
          var again = b.slice(repStart, stop);
          for (var i = 0; i < again.length; i++) b.push(again[i]);
        }
        repStart = null;
      } else if ((m = /^(LZ\||LZ|\||\[|\]|Z)/.exec(s))) {
        closeBar();
      } else if ((m = /^Kcl/.exec(s))) {
        repeatBars(1);
      } else if ((m = /^r\|?(XyQ)?/.exec(s))) {
        repeatBars(2);
      } else if ((m = /^x/.exec(s))) {
        repeatBars(1);
      } else if ((m = /^n/.exec(s))) {
        // N.C.: nessun accordo in questa cella
      } else if ((m = /^(W|[A-G][#b]?)([+\-^\dhob#suadlt]*)(\/[A-G][#b]?)?/.exec(s))) {
        var rootTok = m[1] === 'W' ? lastRoot : m[1];
        if (m[1] !== 'W') lastRoot = m[1] + m[2];
        if (rootTok) {
          var sym = convertChord((m[1] === 'W' ? rootTok : m[1] + m[2]) + (m[3] || ''));
          if (sym) pushChord(sym);
        }
      } else {
        m = [s[0]];   // XyQ, Y, U, S, Q, f, s, l, p, spazi, virgole: solo impaginazione
        if (s.indexOf('XyQ') === 0) m = ['XyQ'];
      }
      s = s.slice(m[0].length);
    }
    closeBar();
    sections = sections.filter(function (x) { return x.bars.length; });
    return { sections: sections, meter: meter || '4/4', notes: notes };
  }

  // "Marks Gerald" (iReal mette il cognome prima) → "Gerald Marks"
  function composerName(c) {
    if (!c) return '';
    var p = c.trim().split(/\s+/);
    return p.length === 2 ? p[1] + ' ' + p[0] : c.trim();
  }
  function slug(t) {
    return (t || 'brano').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brano';
  }

  function parseSong(chunk, isBook) {
    var parts = chunk.split('=');
    var mi = -1, i;
    for (i = 0; i < parts.length; i++) if (parts[i].indexOf(MUSIC_PREFIX) === 0) { mi = i; break; }
    var music, head, tail;
    if (mi >= 0) {
      music = unscramble(parts[mi].slice(MUSIC_PREFIX.length));
      head = parts.slice(0, mi); tail = parts.slice(mi + 1);
    } else if (isBook || parts.length >= 6) {
      // irealbook://Titolo=Compositore=Stile=Tonalità=n=Musica (musica in chiaro)
      var nonEmpty = parts.filter(function (x) { return x !== ''; });
      music = nonEmpty[nonEmpty.length - 1];
      head = nonEmpty.slice(0, -1); tail = [];
    } else return null;
    var title = (head[0] || '').trim();
    var composer = head[1] || '';
    var rest = head.slice(2).filter(function (x) { return x !== ''; });
    var key = '', style = '';
    for (i = rest.length - 1; i >= 0; i--) if (/^[A-G][#b]?-?$/.test(rest[i])) { key = rest[i]; rest.splice(i, 1); break; }
    style = rest.filter(function (x) { return !/^-?\d+$/.test(x); })[0] || '';
    var bpm = parseInt(tail.filter(function (x) { return x !== ''; })[1], 10);
    var body = parseMusic(music || '');
    if (!body.sections.length) return null;
    var song = {
      id: slug(title),
      title: title || 'Brano iReal',
      artist: composerName(composer),
      key: keyName(key),
      meter: body.meter,
      capo: 0,
      tags: ['ireal'].concat(style ? [style.toLowerCase()] : []),
      sections: body.sections.map(function (x) { return { name: x.name, bars: x.bars }; })
    };
    if (bpm > 0) song.bpm = bpm;
    return song;
  }

  function looksLikeIreal(text) {
    return /irealb(?:ook)?:\/\//.test(text || '');
  }

  // Accetta un link, più link, o l'HTML di una playlist esportata.
  function parse(text) {
    var links = (text || '').match(LINK_RE) || [];
    var out = { name: '', songs: [] };
    links.forEach(function (link) {
      var isBook = /^irealbook:/.test(link);
      var dec;
      try { dec = decodeURIComponent(link.replace(/^irealb(?:ook)?:\/\//, '')); } catch (e) { return; }
      var chunks = dec.split('===');
      if (chunks.length > 1 && chunks[chunks.length - 1].indexOf('=') < 0) out.name = out.name || chunks.pop().trim();
      chunks.forEach(function (ch) {
        if (!ch.trim()) return;
        var song = parseSong(ch, isBook);
        if (song) out.songs.push(song);
      });
    });
    return out;
  }

  var api = { looksLikeIreal: looksLikeIreal, parse: parse, convertChord: convertChord, _unscramble: unscramble, _parseMusic: parseMusic };
  if (typeof window !== 'undefined') window.IrealImport = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
