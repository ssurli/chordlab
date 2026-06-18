// build.js — genera chordlab-standalone.html (file unico, zero dipendenze)
// inlineando TUTTI gli <script src="..."> locali (engine, instruments, chordpro,
// songs e i vendor/*) dentro index.html.  Uso:  node build.js
'use strict';
var fs = require('fs');
var path = require('path');

var DIR = __dirname;
var html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');

// Inlinea ogni <script src="LOCALE"></script> (ignora gli URL http/https).
html = html.replace(/<script src="([^"]+)"><\/script>/g, function (m, src) {
  if (/^https?:\/\//.test(src)) return m;
  var code = fs.readFileSync(path.join(DIR, src), 'utf8').replace(/<\/script>/gi, '<\\/script>');
  return '<script>\n' + code + '\n</script>';
});

if (/<script src="(?!https?:)/.test(html)) {
  console.error('ATTENZIONE: restano script locali non inlineati.');
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, 'chordlab-standalone.html'), html);
console.log('OK: chordlab-standalone.html rigenerato (' + html.length + ' byte).');
