const path = require("path");
const {
  Kinobi,
  RenameNodesVisitor,
  RenderJavaScriptVisitor,
  MarkNodesAsInternalVisitor,
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

// Rename nodes.
kinobi.update(
  new RenameNodesVisitor({
    candyMachineCore: {
      name: "mplCandyMachineCore",
      prefix: "Cm",
      instructions: {
        Initialize: "InitializeCandyMachine",
        Update: "UpdateCandyMachine",
        Mint: "MintFromCandyMachine",
        SetAuthority: "SetCandyMachineAuthority",
        Withdraw: "DeleteCandyMachine",
      },
    },
    candyGuard: {
      name: "mplCandyGuard",
      prefix: "Cg",
      instructions: {
        Initialize: "InitializeCandyGuard",
        Update: "UpdateCandyGuard",
        Mint: "MintFromCandyGuard",
        SetAuthority: "SetCandyGuardAuthority",
        Withdraw: "DeleteCandyGuard",
      },
    },
  })
);

// Make some nodes internal to override them with custom code.
kinobi.update(
  new MarkNodesAsInternalVisitor([
    { account: "CandyMachine" },
    { account: "CandyGuard" },
  ])
);

// Generate JavaScript client.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
