const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  SetInstructionAccountDefaultValuesVisitor,
  SetInstructionDiscriminatorsVisitor,
  SetLeafWrappersVisitor,
  RenameNodesVisitor,
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
  path.join(idlDir, "mpl_system_extras.json"),
  path.join(idlDir, "mpl_token_extras.json"),
]);

// Set SPL Token instruction discriminators.
kinobi.update(
  new SetInstructionDiscriminatorsVisitor({
    // "splToken.InitializeMint": { value: 0 },
    "splToken.InitializeAccount": { value: 1 },
    "splToken.InitializeMultisig": { value: 2 },
    "splToken.Transfer": { value: 3 },
    "splToken.Approve": { value: 4 },
    "splToken.Revoke": { value: 5 },
    "splToken.SetAuthority": { value: 6 },
    "splToken.MintTo": { value: 7 },
    "splToken.Burn": { value: 8 },
    "splToken.CloseAccount": { value: 9 },
    "splToken.FreezeAccount": { value: 10 },
    "splToken.ThawAccount": { value: 11 },
    "splToken.TransferChecked": { value: 12 },
    "splToken.ApproveChecked": { value: 13 },
    "splToken.MintToChecked": { value: 14 },
    "splToken.BurnChecked": { value: 15 },
    "splToken.InitializeAccount2": { value: 16 },
    "splToken.SyncNative": { value: 17 },
    "splToken.InitializeAccount3": { value: 18 },
    "splToken.InitializeMultisig2": { value: 19 },
    "splToken.InitializeMint2": { value: 20 },
    "splToken.GetAccountDataSize": { value: 21 },
    "splToken.InitializeImmutableOwner": { value: 22 },
    "splToken.AmountToUiAmount": { value: 23 },
    "splToken.UiAmountToAmount": { value: 24 },
    "splToken.InitializeMintCloseAuthority": { value: 25 },
    "splToken.TransferFeeExtension": { value: 26 },
    "splToken.ConfidentialTransferExtension": { value: 27 },
    "splToken.DefaultAccountStateExtension": { value: 28 },
    "splToken.Reallocate": { value: 29 },
    "splToken.MemoTransferExtension": { value: 30 },
    "splToken.CreateNativeMint": { value: 31 },
    "splToken.InitializeNonTransferableMint": { value: 32 },
    "splToken.InterestBearingMintExtension": { value: 33 },
    "splToken.CpiGuardExtension": { value: 34 },
    "splToken.InitializePermanentDelegate": { value: 35 },
  })
);

// Rename nodes.
kinobi.update(
  new RenameNodesVisitor({
    splSystem: { prefix: "Sys" },
    splMemo: { prefix: "Memo" },
    splToken: {
      prefix: "Tok",
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
    splAssociatedToken: { prefix: "Ata" },
    mplSystemExtras: { prefix: "SysEx" },
    mplTokenExtras: { prefix: "TokEx" },
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
    { instruction: "TransferSol", account: "source", kind: "identity" },
    { instruction: "TransferAllSol", account: "source", kind: "identity" },
  ])
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
