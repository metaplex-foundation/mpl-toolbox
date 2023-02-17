const path = require("path");
const {
  Kinobi,
  RenderJavaScriptVisitor,
  SetLeafWrappersVisitor,
  UpdateAccountsVisitor,
  UpdateInstructionsVisitor,
  UpdateProgramsVisitor,
} = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = new Kinobi([
  path.join(idlDir, "spl_system.json"),
  path.join(idlDir, "spl_memo.json"),
  path.join(idlDir, "spl_token.json"),
  path.join(idlDir, "spl_associated_token.json"),
  path.join(idlDir, "spl_address_lookup_table.json"),
  path.join(idlDir, "mpl_system_extras.json"),
  path.join(idlDir, "mpl_token_extras.json"),
]);

// Update programs.
kinobi.update(
  new UpdateProgramsVisitor({
    splSystem: { prefix: "Sys" },
    splMemo: { prefix: "Memo" },
    splToken: { prefix: "Tok" },
    splAssociatedToken: { prefix: "Ata" },
    splAddressLookupTable: { prefix: "Lut" },
    mplSystemExtras: { prefix: "SysEx" },
    mplTokenExtras: { prefix: "TokEx" },
  })
);

// Update accounts.
kinobi.update(
  new UpdateAccountsVisitor({
    "splToken.mint": { discriminator: { kind: "size" } },
    "splToken.token": { discriminator: { kind: "size" } },
    "splToken.multisig": { discriminator: { kind: "size" } },
  })
);

// Update instructions.
const ataPdaDefaults = {
  kind: "pda",
  pdaAccount: "AssociatedToken",
  dependency: "rootHooked",
  seeds: {
    owner: { kind: "account", name: "owner" },
    mint: { kind: "account", name: "mint" },
  },
};
kinobi.update(
  new UpdateInstructionsVisitor({
    TransferSol: {
      accounts: {
        source: { defaultsTo: { kind: "identity" } },
      },
    },
    TransferAllSol: {
      accounts: {
        source: { defaultsTo: { kind: "identity" } },
      },
    },
    MintTokensTo: {
      accounts: {
        mintAuthority: { defaultsTo: { kind: "identity" } },
      },
    },
    CreateAccount: {
      bytesCreatedOnChain: { kind: "arg", name: "space" },
    },
    CreateAccountWithRent: {
      bytesCreatedOnChain: { kind: "arg", name: "space" },
    },
    CreateAssociatedToken: {
      bytesCreatedOnChain: { kind: "account", name: "Token" },
      accounts: {
        owner: { defaultsTo: { kind: "identity" } },
        ata: { defaultsTo: ataPdaDefaults },
      },
    },
    CreateTokenIfMissing: {
      accounts: {
        ata: { defaultsTo: ataPdaDefaults },
        token: { defaultsTo: { kind: "account", name: "ata" } },
        owner: { defaultsTo: { kind: "identity" } },
      },
    },
  })
);

// Wrap leaves.
kinobi.update(
  new SetLeafWrappersVisitor({
    "splSystem.CreateAccount.lamports": { kind: "SolAmount" },
    "splSystem.TransferSol.amount": { kind: "SolAmount" },
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new RenderJavaScriptVisitor(jsDir, { prettier }));
