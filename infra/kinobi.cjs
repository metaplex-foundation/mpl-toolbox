const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
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

// Wrap leafs in amounts or datetimes.
kinobi.update(
  new SetLeafWrappersVisitor({
    "splSystem.CreateAccount.lamports": {
      kind: "Amount",
      identifier: "SOL",
      decimals: 9,
    },
  })
);

// Generate JavaScript client.
const jsDir = path.join(clientDir, "js-system", "src", "generated");
const prettier = require(path.join(clientDir, "js-system", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
