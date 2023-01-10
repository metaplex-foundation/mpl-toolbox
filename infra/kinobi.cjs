const path = require("path");
const {
  Kinobi,
  RenameNodesVisitor,
  RenderJavaScriptVisitor,
  MarkNodesAsInternalVisitor,
  SetLeafWrappersVisitor,
} = require("@lorisleiva/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");
const idlPaths = [
  path.join(idlDir, "spl_system.json"),
  path.join(idlDir, "spl_memo.json"),
];

// Instantiate Kinobi.
const kinobi = new Kinobi(idlPaths);

// Rename nodes.
// kinobi.update(new RenameNodesVisitor({}));

// Wrap leafs in amounts or datetimes.
// kinobi.update(
//   new SetLeafWrappersVisitor({
//     "mplCandyGuard.StartDate.date": { kind: "DateTime" },
//     "mplCandyGuard.EndDate.date": { kind: "DateTime" },
//   })
// );

// Make some nodes internal to override them with custom code.
// kinobi.update(
//   new MarkNodesAsInternalVisitor([
//     { name: "CandyMachine", type: "account" },
//     { name: "CandyGuard", type: "account" },
//   ])
// );

// Generate JavaScript client.
const jsDir = path.join(clientDir, "js-system", "src", "generated");
const prettier = require(path.join(clientDir, "js-system", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
