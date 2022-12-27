const path = require("path");
const {
  Kinobi,
  RenameNodesVisitor,
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

// Instantiate and transform Kinobi.
const kinobi = new Kinobi(idlPaths);
kinobi.update(
  new RenameNodesVisitor({
    candyMachineCore: {
      instructions: {
        Initialize: "InitializeCandyMachine",
        Update: "UpdateCandyMachine",
        Mint: "MintFromCandyMachine",
        SetAuthority: "SetCandyMachineAuthority",
        Withdraw: "DeleteCandyMachine",
      },
      errors: {
        IncorrectOwner: "CmIncorrectOwner",
        Uninitialized: "CmUninitialized",
        NumericalOverflowError: "CmNumericalOverflowError",
        CandyMachineEmpty: "CmCandyMachineEmpty",
        CollectionKeyMismatch: "CmCollectionKeyMismatch",
      },
    },
    candyGuard: {
      instructions: {
        Initialize: "InitializeCandyGuard",
        Update: "UpdateCandyGuard",
        Mint: "MintFromCandyGuard",
        SetAuthority: "SetCandyGuardAuthority",
        Withdraw: "DeleteCandyGuard",
      },
      errors: {
        IncorrectOwner: "CgIncorrectOwner",
        Uninitialized: "CgUninitialized",
        NumericalOverflowError: "CgNumericalOverflowError",
        CandyMachineEmpty: "CgCandyMachineEmpty",
        CollectionKeyMismatch: "CgCollectionKeyMismatch",
      },
    },
  })
);
kinobi.accept(new ValidateNodesVisitor());

// Generate JavaScript client.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
