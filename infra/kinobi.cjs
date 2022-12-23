const path = require("path");
const { Kinobi, RenderJavaScriptVisitor } = require("@lorisleiva/kinobi");

// IDL paths.
const idlDir = path.join(__dirname, "..", "idls");
const idlPaths = [
  path.join(idlDir, "candy_machine_core.json"),
  path.join(idlDir, "candy_guard.json"),
];

// Client paths.
const clientDir = path.join(__dirname, "..", "clients");
const jsDir = path.join(clientDir, "js", "src", "generated");

// Generate clients.
const kinobi = new Kinobi(idlPaths);
kinobi.accept(new RenderJavaScriptVisitor(jsDir));
