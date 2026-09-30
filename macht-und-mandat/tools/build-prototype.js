/* Baut prototype/index.html aus prototype/src (eine einzige, offlinefähige Datei).  node tools/build-prototype.js */
'use strict';
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../prototype/src');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const js = fs.readdirSync(path.join(dir, 'js')).filter(f => f.endsWith('.js')).sort()
  .map(f => `/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(dir, 'js', f), 'utf8')).join('\n');
const html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8').replace('{{CSS}}', () => css).replace('{{JS}}', () => js);
fs.writeFileSync(path.join(__dirname, '../prototype/index.html'), html);
console.log('index.html:', (html.length / 1024).toFixed(1), 'KB');
