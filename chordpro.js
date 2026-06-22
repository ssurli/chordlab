// chordpro.js — import/export ChordPro (nativo, zero dipendenze)
// Mappa il formato ChordPro sul modello ChordLab (sezioni di misure).
// Espone window.ChordPro = { format(song) -> string, parse(text) -> song }.
(function () {
  'use strict';

  // ---- EXPORT: song -> testo ChordPro ----
  function format(song) {
    var L = [];
    if (song.title)  L.push('{title: ' + song.title + '}');
    if (song.artist) L.push('{artist: ' + song.artist + '}');
    if (song.key)    L.push('{key: ' + song.key + '}');
    if (song.meter)  L.push('{meter: ' + song.meter + '}');
    if (song.year)   L.push('{year: ' + song.year + '}');
    if (song.capo)   L.push('{capo: ' + song.capo + '}');
    if (song.tags && song.tags.length) L.push('{tags: ' + song.tags.join(', ') + '}');
    L.push('');
    (song.sections || []).forEach(function (sec) {
      L.push('{comment: ' + (sec.name || 'Section') + '}');
      var bars = (sec.bars || []).map(function (b) { return ' ' + String(b).trim() + ' '; });
      // 4 misure per riga, stile lead-sheet: | C | G | Am | F |
      for (var i = 0; i < bars.length; i += 4) {
        L.push('|' + bars.slice(i, i + 4).join('|') + '|');
      }
      L.push('');
    });
    return L.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  // ---- IMPORT: testo ChordPro -> song ----
  var DIRECTIVE = /^\s*\{\s*([a-zA-Z_]+)\s*:?\s*([^}]*)\}\s*$/;
  var SECTION_DIRECTIVES = {
    soc: 'Chorus', start_of_chorus: 'Chorus',
    sov: 'Verse', start_of_verse: 'Verse',
    sob: 'Bridge', start_of_bridge: 'Bridge',
    sot: 'Tab', start_of_tab: 'Tab',
    sop: 'Part', start_of_part: 'Part'
  };

  function slug(str) {
    return String(str || '').toLowerCase().trim()
      .replace(/['’"`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'brano';
  }

  // estrae i simboli accordo [X] da una riga "chords over lyrics"
  function bracketChords(line) {
    var out = [], m, re = /\[([^\]]+)\]/g;
    while ((m = re.exec(line))) out.push(m[1].trim());
    return out;
  }

  function parse(text) {
    var song = { title: '', artist: '', year: '', key: '', capo: 0, tags: [], sections: [] };
    var cur = null;
    function ensureSection(name) {
      cur = { name: name || 'Section', bars: [] };
      song.sections.push(cur);
    }
    String(text).split(/\r?\n/).forEach(function (raw) {
      var line = raw.replace(/\s+$/,'');
      if (line.trim() === '') return;

      var d = DIRECTIVE.exec(line);
      if (d) {
        var key = d[1].toLowerCase(), val = (d[2] || '').trim();
        if (key === 'title' || key === 't') song.title = val;
        else if (key === 'artist' || key === 'subtitle' || key === 'st') song.artist = song.artist || val;
        else if (key === 'key') song.key = val;
        else if (key === 'meter' || key === 'time' || key === 'metre') { if (/^\d+\/\d+$/.test(val)) song.meter = val; }
        else if (key === 'year') song.year = val;
        else if (key === 'capo') song.capo = parseInt(val, 10) || 0;
        else if (key === 'tags') song.tags = val.split(',').map(function (t){return t.trim();}).filter(Boolean);
        else if (key === 'comment' || key === 'c') ensureSection(val || 'Section');
        else if (SECTION_DIRECTIVES[key]) ensureSection(SECTION_DIRECTIVES[key]);
        // {end_of_*} e direttive ignote: nessuna azione
        return;
      }

      if (line.indexOf('|') >= 0) {
        // riga a battute: | C | G | Am F |
        if (!cur) ensureSection('Section');
        line.split('|').forEach(function (seg) {
          var s = seg.trim();
          if (s !== '') cur.bars.push(s);
        });
        return;
      }

      var chords = bracketChords(line);
      if (chords.length) {
        // "chords over lyrics": ogni accordo diventa una misura
        if (!cur) ensureSection('Section');
        chords.forEach(function (c) { cur.bars.push(c); });
      }
      // righe di solo testo (liriche): ignorate (ChordLab è a sole misure)
    });

    if (!song.sections.length) song.sections.push({ name: 'Verse', bars: [] });
    if (!song.key) song.key = 'C';
    song.id = slug(song.title || 'brano-importato');
    return song;
  }

  window.ChordPro = { format: format, parse: parse, formatMany: formatMany, parseMany: parseMany };

  // ---- MULTI-brano (una scaletta in un unico file) ----
  function formatMany(songs) {
    return (songs || []).map(format).join('\n{new_song}\n\n');
  }
  function parseMany(text) {
    var chunks = String(text).split(/^[ \t]*\{[ \t]*(?:new_song|ns)[ \t]*\}[ \t]*$/m);
    var out = [];
    chunks.forEach(function (c) { if (c.trim() !== '') out.push(parse(c)); });
    return out.length ? out : [parse(text)];
  }
})();
