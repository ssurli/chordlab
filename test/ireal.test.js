// node test/ireal.test.js — import iReal Pro (zero dipendenze)
'use strict';
var assert = require('assert');
global.window = {};
require('../engine.js');
var IR = require('../ireal.js');

// lo scrambler è un'involuzione: applicarlo due volte restituisce l'originale
function encode(title, composer, style, key, music) {
  var body = [title, composer, '', style, key, '', '1r34LbKcu7' + IR._unscramble(music), '0', '120', '3'].join('=');
  return 'irealb://' + encodeURIComponent(body);
}
var ok = 0;
function t(name, fn) { fn(); ok++; console.log('  ok  ' + name); }

var MUSIC = '[*AT44C^7XyQKcl LZEadd9XyQKcl LZAsus A7susadd3LZsA, ,lBLZD-7XyQKcl  ][*BE7XyQKcl LZA-7XyQKcl LZD7XyQKcl LZD-7XyQ|G7XyQ][*AC^7XyQKcl LZE7XyQKcl LZA7XyQKcl LZD-7XyQKcl  ][*CF^7XyQ|F-6(F#o7)XyQ|E-7(C^7/G)XyQ|A7XyQ|D-7XyQ|G7XyQ|C6 Ebo7LZD-7 G7 Z';

t('unscramble è un\'involuzione', function () {
  assert.strictEqual(IR._unscramble(IR._unscramble(MUSIC)), MUSIC);
});

t('accordi iReal → ChordEngine', function () {
  var cases = { 'C^7': 'Cmaj7', 'D-7': 'Dm7', 'Bh7': 'Bm7b5', 'Bh': 'Bm7b5', 'Ebo7': 'Ebdim7', 'Bbo': 'Bbdim',
                'G+': 'Gaug', 'F-6': 'Fm6', 'A-^7': 'Ammaj7', 'G7sus': 'G7sus4', 'C^9': 'Cmaj9', 'G7b9': 'G7b9', 'D-7/C': 'Dm7/C' };
  Object.keys(cases).forEach(function (k) { assert.strictEqual(IR.convertChord(k), cases[k], k); });
});

t('brano singolo: titolo, compositore, tonalità, metrica, sezioni', function () {
  var r = IR.parse(encode('All Of Me', 'Marks Gerald', 'Medium Swing', 'C', MUSIC));
  assert.strictEqual(r.songs.length, 1);
  var s = r.songs[0];
  assert.strictEqual(s.title, 'All Of Me');
  assert.strictEqual(s.artist, 'Gerald Marks');
  assert.strictEqual(s.key, 'C');
  assert.strictEqual(s.meter, '4/4');
  assert.strictEqual(s.bpm, 120);
  assert.deepStrictEqual(s.sections.map(function (x) { return x.name; }), ['A', 'B', 'A', 'C']);
  assert.deepStrictEqual(s.sections[0].bars, ['Cmaj7', 'Cmaj7', 'Eadd9', 'Eadd9', 'Asus4 A7susadd3', 'A B', 'Dm7', 'Dm7']);
  // accordi alternativi tra parentesi esclusi
  assert.deepStrictEqual(s.sections[3].bars, ['Fmaj7', 'Fm6', 'Em7', 'A7', 'Dm7', 'G7', 'C6 Ebdim7', 'Dm7 G7']);
  s.sections.forEach(function (x) { x.bars.forEach(function (b) { b.split(' ').forEach(function (c) {
    assert.ok(window.ChordEngine.parse(c), 'ChordEngine legge ' + c);
  }); }); });
});

t('tonalità minore e playlist con nome (HTML esportato)', function () {
  var a = encode('Uno', 'Rossi Mario', 'Bossa Nova', 'A-', '*AT34A-7XyQ|D7XyQZ');
  var b = encode('Due', 'Bianchi Luca', 'Ballad', 'Eb', '*AT44Eb^7XyQ|Bb7XyQZ');
  var link = 'irealb://' + encodeURIComponent(decodeURIComponent(a.slice(9)) + '===' + decodeURIComponent(b.slice(9)) + '===Jazz Set');
  var html = '<html><body><a href="' + link + '">Jazz Set</a></body></html>';
  assert.ok(IR.looksLikeIreal(html));
  var r = IR.parse(html);
  assert.strictEqual(r.name, 'Jazz Set');
  assert.strictEqual(r.songs.length, 2);
  assert.strictEqual(r.songs[0].key, 'Am');
  assert.strictEqual(r.songs[0].meter, '3/4');
  assert.deepStrictEqual(r.songs[0].sections[0].bars, ['Am7', 'D7']);
  assert.strictEqual(r.songs[1].key, 'Eb');
});

t('ripetizioni con finali 1 e 2 scritte per esteso', function () {
  var r = IR.parse(encode('Rip', '', 'Rock', 'G', '{*AT44G XyQ|C XyQ|N1D XyQ}XyQ|N2E- XyQZ'));
  assert.deepStrictEqual(r.songs[0].sections[0].bars, ['G', 'C', 'D', 'G', 'C', 'Em']);
});

t('ripetizione semplice e battuta ripetuta (x, Kcl)', function () {
  var r = IR.parse(encode('Rip2', '', 'Rock', 'E', '{*AT44E XyQKcl LZA XyQ}Z'));
  assert.deepStrictEqual(r.songs[0].sections[0].bars, ['E', 'E', 'A', 'E', 'E', 'A']);
});

t('testo senza link iReal', function () {
  assert.strictEqual(IR.looksLikeIreal('[C]Hello'), false);
  assert.strictEqual(IR.parse('niente').songs.length, 0);
});

console.log(ok + ' test ok');
