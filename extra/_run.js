const fs = require("fs");
const path = require("path");

const DEVTOOLS_DIR = path.join(process.cwd(), "..");

const DEVTOOLS_HTML = path.join(DEVTOOLS_DIR, "devtools_app.html");
const INDEX_HTML = path.join(DEVTOOLS_DIR, "index.html");
const MESSAGE_CONNECTION_TEMPLATE = path.join(process.cwd(), "MessageConnection.js");
const CONNECTIONS_FILE = path.join(DEVTOOLS_DIR, "core/sdk/Connections.js");
const CURRENT_FILE = path.join(process.cwd(), "_run.js");

// Patch devtools_app.html and index.html
const indexContents = fs.readFileSync(DEVTOOLS_HTML, "utf-8");
const newContents = indexContents.replace(`<script type="module" src="./entrypoints/devtools_app/devtools_app.js"></script>`, function(old) {
  return old + `\n<script src="./extra/Theme.js"></script>`
});

fs.writeFileSync(DEVTOOLS_HTML, newContents);
fs.writeFileSync(INDEX_HTML, newContents);
console.log(`[Patcher] Patched: devtools_app.html, index.html`);
// Patch /core/sdk/Connections.js
const msgConnContents = fs.readFileSync(MESSAGE_CONNECTION_TEMPLATE, "utf-8");
const connectionContents = fs.readFileSync(CONNECTIONS_FILE, "utf-8");
const newConnContents = connectionContents.replace(/export class WebSocket/gmi, function(old) {
    return (msgConnContents + "\n" + old);
});
fs.writeFileSync(CONNECTIONS_FILE, newConnContents);
console.log(`[Patcher] Patched: /core/sdk/Connections.js`);

fs.rmSync(CURRENT_FILE);
process.exit(0);
