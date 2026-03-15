const path = require("path");
const fs = require("fs");

console.log("[Patcher] Starting Patcher")

const DEVTOOLS_FRONTEND = process.cwd();
const FRONTEND_DIR = path.join(DEVTOOLS_FRONTEND, "front_end");
const PANELS_DIR = path.join(FRONTEND_DIR, "panels");

const permittedPanels = ["application", "console", "developer_resources", "elements", "network", "protocol_monitor", "settings", "sources"];

const PANELS = fs.readdirSync(PANELS_DIR, { withFileTypes: true }).filter(o => o.isDirectory());

console.log(`[Patcher] Found ${PANELS.length} Panel Directories`);

for (const panel of PANELS) {
  const HAS_META = fs.existsSync(path.join(PANELS_DIR, panel.name + `/${panel.name}-meta.ts`));
  if (HAS_META && !permittedPanels.includes(panel.name)) {
    console.log(`[Patcher] Disabling ${panel.name} from DevTools`);
    // const META_CONTENTS = fs.readFileSync(path.join(PANELS_DIR, panel.name + "-meta.ts"));
    // const NEW_CONTENTS = META_CONTENTS.replaceAll("UI.ViewManager.registerViewExtension", ";(function noop(){})");
    fs.writeFileSync(path.join(PANELS_DIR, panel.name + `/${panel.name}-meta.ts`), Buffer.from([]));
    console.log(`[Patcher] Disabled ${panel.name}`);
  }
}

console.log("Finished Patching...")
