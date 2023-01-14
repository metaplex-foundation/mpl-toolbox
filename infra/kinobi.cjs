const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  SetLeafWrappersVisitor,
  RenameNodesVisitor,
} = require("@lorisleiva/kinobi");
const {
  SetInstructionAccountDefaultValuesVisitor,
} = require("@lorisleiva/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = new Kinobi([
  path.join(idlDir, "spl_system.json"),
  path.join(idlDir, "spl_memo.json"),
  path.join(idlDir, "spl_token.json"),
  path.join(idlDir, "spl_associated_token_account.json"),
]);

// Rename nodes.
kinobi.update(
  new RenameNodesVisitor({
    splToken: {
      accounts: { Account: "Token" },
      instructions: {
        Approve: "ApproveTokenDelegate",
        ApproveChecked: "ApproveTokenDelegateChecked",
        Burn: "BurnToken",
        BurnChecked: "BurnTokenChecked",
        CloseAccount: "CloseToken",
        FreezeAccount: "FreezeToken",
        GetAccountDataSize: "GetTokenDataSize",
        InitializeAccount: "InitializeToken",
        InitializeAccount2: "InitializeToken2",
        InitializeAccount3: "InitializeToken3",
        MintTo: "MintTokensTo",
        MintToChecked: "MintTokensToChecked",
        Revoke: "RevokeTokenDelegate",
        ThawAccount: "ThawToken",
        Transfer: "TransferTokens",
        TransferChecked: "TransferTokensChecked",
      },
    },
  })
);

// Wrap leaves.
kinobi.update(
  new SetLeafWrappersVisitor({
    "splSystem.CreateAccount.lamports": { kind: "SolAmount" },
    "splSystem.TransferSol.lamports": { kind: "SolAmount" },
  })
);

// Set default values for instruction accounts.
kinobi.update(
  new SetInstructionAccountDefaultValuesVisitor([
    { instruction: "TransferSol", account: "from", kind: "identity" },
  ])
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
