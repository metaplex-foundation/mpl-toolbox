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

// Helpers.
function renderJs(kinobi, dir) {
  const jsDir = path.join(clientDir, dir, "src", "generated");
  const prettier = require(path.join(clientDir, dir, ".prettierrc.json"));
  kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
}

// System Client.
const system = new Kinobi(path.join(idlDir, "spl_system.json"));
system.update(
  new SetLeafWrappersVisitor({
    "splSystem.CreateAccount.lamports": { kind: "SolAmount" },
    "splSystem.TransferSol.lamports": { kind: "SolAmount" },
  })
);
system.update(
  new SetInstructionAccountDefaultValuesVisitor([
    { instruction: "TransferSol", account: "from", kind: "identity" },
  ])
);
renderJs(system, "js-system");

// Memo Client.
const memo = new Kinobi(path.join(idlDir, "spl_memo.json"));
renderJs(memo, "js-memo");

// Token Client.
const token = new Kinobi(path.join(idlDir, "spl_token.json"));
token.update(
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
        InitlializeAccount: "InitlializeToken",
        InitlializeAccount2: "InitlializeToken2",
        InitlializeAccount3: "InitlializeToken3",
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
renderJs(token, "js-token");

// ATA Client.
const ata = new Kinobi(path.join(idlDir, "spl_associated_token_account.json"));
renderJs(ata, "js-associated-token");
