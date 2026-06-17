// build.js — genera chordlab-standalone.html (file unico, zero dipendenze)
// inlineando engine.js, instruments.js e songs.js dentro index.html.
// Uso:  node build.js
// Nessuna dipendenza esterna. La sorgente di verità resta index.html + i 3 .js.
'use strict';
var fs = require('fs');
var path = require('path');

var DIR = __dirname;
function read(f){ return fs.readFileSync(path.join(DIR, f), 'utf8'); }

var html = read('index.html');

function inline(file){
  return '<script>\n' + read(file).replace(/<\/script>/gi, '<\\/script>') + '\n</script>';
}

html = html
  .replace('<script src="engine.js"></script>', inline('engine.js'))
  .replace('<script src="instruments.js"></script>', inline('instruments.js'))
  .replace('<script src="songs.js"></script>', inline('songs.js'));

if (html.indexOf('<script src=') !== -1) {
  console.error('ATTENZIONE: restano tag <script src> non inlineati. Controlla index.html.');
  process.exit(1);
}

fs.writeFileSync(path.join(DIR, 'chordlab-standalone.html'), html);
console.log('OK: chordlab-standalone.html rigenerato (' + html.length + ' byte).');
