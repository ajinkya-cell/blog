const fs = require('fs');

const inputFile = process.argv[2] || 'hairline-blog-files.html';
const outputFile = process.argv[3] || 'apps/web/public/blog-files.html';

let html = fs.readFileSync(inputFile, 'utf8');

// Replace body content to only contain the stage and hidden dummy elements
html = html.replace(/<main>[\s\S]*?<\/main>/, `<div id="stage" style="width:100%;height:100%;cursor:pointer;"></div>
<div style="display:none">
  <span id="name"></span>
  <span id="read"></span>
  <input id="intensity" type="range" min="0" max="1" step="0.01" value="0.5">
  <output id="value"></output>
  <button id="theme"></button>
  <p id="means"></p>
  <p id="rules"></p>
  <p id="error"></p>
</div>`);

// Adjust styles for iframe usage
html = html.replace(/margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px 16px;\s*background: var\(--ground\); color: var\(--ink\);/, 'margin: 0; width: 100vw; height: 100vh; overflow: hidden; background: transparent;');

// Ensure click propagation
html = html.replace("down: () => { window.parent.location.href='/blog'; }", "down: () => { window.parent.location.href='/blog'; }");

fs.writeFileSync(outputFile, html);
console.log(`Cleaned HTML saved to ${outputFile}`);
