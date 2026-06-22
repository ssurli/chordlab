// crd.js — import di file .crd / chord-sheet in testo semplice (zero dipendenze)
// Un .crd è un foglio accordi "chords over lyrics": righe di soli accordi
// alternate a righe di testo. Questo modulo riconosce le righe-accordo e le
// converte nel modello ChordLab (sezioni di misure), senza le liriche.
// Espone window.CrdImport = { parse(text) -> song, looksLikeCrd(text) -> bool }.
(function () {
  'use strict';

  // Validatore "stretto" di un simbolo accordo. NON usa ChordEngine.parse perché
  // quello accetta qualunque parola che inizi per A-G (es. "Bed" -> B + "ed").
  var CHORD_RE = /^[A-G](#|b|♯|♭)?(maj|min|m|dim|aug|sus|add|M|°|ø|Δ|\+|\d|b5|#5|b9|#9|#11|b13|alt|no\d)*(\/[A-G](#|b|♯|♭)?)?$/;
  var SPECIAL = { 'N.C.': 1, 'NC': 1, '%': 1, '/': 1, '|': 1 };

  function looksLikeChord(tok) {
    if (!tok) return false;
    var t = tok.replace(/[(),.;:]+$/, '').replace(/^\(/, '');
    if (SPECIAL[t.toUpperCase()] || SPECIAL[t]) return true;
    return CHORD_RE.test(t);
  }

  // Una riga è "riga accordi" se ha >=1 token e TUTTI i token sembrano accordi.
  function isChordLine(line) {
    var toks = line.trim().split(/\s+/).filter(Boolean);
    if (!toks.length) return false;
    for (var i = 0; i < toks.length; i++) {
      if (!looksLikeChord(toks[i])) return false;
    }
    return true;
  }

  // Normalizza un token in un simbolo che ChordEngine sa leggere (pulisce parentesi).
  function cleanChord(tok) {
    var t = tok.replace(/[(),.;:]+$/, '').replace(/^\(/, '');
    if (/^(N\.?C\.?|%|\/|\|)$/i.test(t)) return null; // segnaposti non musicali
    return t;
  }

  var SECTION_KW = /^\(?\[?\s*(intro|verse|strofa|chorus|ritornello|rit\.?|bridge|ponte|solo|outro|pre[- ]?chorus|interlude|instrumental|inst\.?|coda|tag|hook|refrain)\b[^\]\)]*\]?\)?\s*:?\s*$/i;

  function headerName(line) {
    var m = /^\[(.+)\]\s*$/.exec(line.trim());           // [Verse 1]
    if (m) return m[1].trim();
    if (SECTION_KW.test(line.trim())) {                    // Chorus:  /  (Intro)
      return line.trim().replace(/^[\[\(]|[\]\)]$/g, '').replace(/:\s*$/, '').trim();
    }
    return null;
  }

  function slug(str) {
    return String(str || '').toLowerCase().trim()
      .replace(/['’"`]/g, '').replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'brano';
  }

  function parse(text) {
    var lines = String(text).replace(/\r\n?/g, '\n').split('\n');
    var song = { title: '', artist: '', year: '', key: '', capo: 0, tags: [], sections: [] };
    var cur = null, sawMusic = false;

    function ensure(name) { cur = { name: name || 'Section', bars: [] }; song.sections.push(cur); }

    // Intestazione: prime righe non-vuote prima di accordi/sezioni -> titolo/artista.
    var idx = 0;
    for (; idx < lines.length; idx++) {
      var raw = lines[idx].trim();
      if (raw === '') continue;
      if (headerName(raw) || isChordLine(raw)) break;
      // Direttive in stile metadato: "Key: G", "Capo: 2"
      var md = /^(key|tonalit[aà]|capo|artist|artista|year|anno|title|titolo)\s*[:=]\s*(.+)$/i.exec(raw);
      if (md) {
        var k = md[1].toLowerCase(), v = md[2].trim();
        if (/key|tonal/.test(k)) song.key = v;
        else if (k === 'capo') song.capo = parseInt(v, 10) || 0;
        else if (/artist/.test(k)) song.artist = v;
        else if (/year|anno/.test(k)) song.year = v;
        else if (/tit/.test(k)) song.title = v;
        continue;
      }
      if (!song.title) {
        if (raw.indexOf(' - ') > 0) { var p = raw.split(' - '); song.title = p[0].trim(); song.artist = p.slice(1).join(' - ').trim(); }
        else song.title = raw;
      } else if (!song.artist) { song.artist = raw; }
    }

    for (; idx < lines.length; idx++) {
      var line = lines[idx].replace(/\s+$/, '');
      if (line.trim() === '') continue;

      var hn = headerName(line);
      if (hn) { ensure(hn); continue; }

      if (isChordLine(line)) {
        if (!cur) ensure('Verse');
        line.trim().split(/\s+/).forEach(function (tok) {
          var c = cleanChord(tok);
          if (c) { cur.bars.push(c); sawMusic = true; }
        });
        continue;
      }
      // riga di testo (lirica): ignorata — ChordLab è a sole misure.
    }

    if (!song.sections.length) song.sections.push({ name: 'Verse', bars: [] });
    if (!song.key && sawMusic) {
      // Indovina la tonalità dal primo accordo, se non dichiarata.
      var first = song.sections[0].bars[0];
      if (first) song.key = first.split('/')[0];
    }
    if (!song.key) song.key = 'C';
    song.id = slug(song.title || 'brano-crd');
    return song;
  }

  // Euristica: il testo è un .crd se contiene almeno una riga di soli accordi.
  function looksLikeCrd(text) {
    var lines = String(text).split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      if (isChordLine(lines[i])) return true;
    }
    return false;
  }

  window.CrdImport = { parse: parse, looksLikeCrd: looksLikeCrd, isChordLine: isChordLine };
})();
