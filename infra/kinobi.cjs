const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  ValidateNodesVisitor,
} = require("@lorisleiva/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");
const idlPaths = [
  path.join(idlDir, "candy_machine_core.json"),
  path.join(idlDir, "candy_guard.json"),
];

// Instantiate Kinobi.
const kinobi = new Kinobi(idlPaths);
kinobi.accept(new ValidateNodesVisitor());

// Generate JavaScript client.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
