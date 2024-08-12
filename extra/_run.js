const fs = require("fs");
const path = require("path");

const DEVTOOLS_DIR = path.join(process.cwd(), "..");

const DEVTOOLS_HTML = path.join(DEVTOOLS_DIR, "devtools_app.html");
const INDEX_HTML = path.join(DEVTOOLS_DIR, "index.html");
const CURRENT_FILE = path.join(process.cwd(), "_run.js");

const indexContents = fs.readFileSync(DEVTOOLS_HTML, "utf-8");
const newContents = indexContents.replace(`<script type="module" src="./entrypoints/devtools_app/devtools_app.js"></script>`, function(old) {
  return old + `\n<script src="./extra/Theme.js"></script>`
});

fs.writeFileSync(DEVTOOLS_HTML, newContents);
fs.writeFileSync(INDEX_HTML, newContents);

console.log(`[Patcher] Patched: devtools_app.html, index.html`);

fs.rmSync(CURRENT_FILE);
process.exit(0);
