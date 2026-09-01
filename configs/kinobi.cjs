const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "idls");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([
  path.join(idlDir, "spl_system.json"),
  path.join(idlDir, "spl_memo.json"),
  path.join(idlDir, "spl_token.json"),
  path.join(idlDir, "spl_associated_token.json"),
  path.join(idlDir, "spl_address_lookup_table.json"),
  path.join(idlDir, "spl_compute_budget.json"),
  path.join(idlDir, "mpl_system_extras.json"),
  path.join(idlDir, "mpl_token_extras.json"),
]);

// Update programs.
kinobi.update(
  new k.UpdateProgramsVisitor({
    splSystem: { prefix: "Sys" },
    splMemo: { prefix: "Memo" },
    splToken: { prefix: "Tok" },
    splAssociatedToken: { prefix: "Ata" },
    splAddressLookupTable: { prefix: "Lut" },
    splComputeBudget: { prefix: "Cb" },
    mplSystemExtras: { prefix: "SysEx" },
    mplTokenExtras: { prefix: "TokEx" },
  })
);

// Update accounts.
kinobi.update(
  new k.UpdateAccountsVisitor({
    "splToken.mint": { discriminator: k.sizeAccountDiscriminator() },
    "splToken.token": { discriminator: k.sizeAccountDiscriminator() },
    "splToken.multisig": { discriminator: k.sizeAccountDiscriminator() },
    "splAddressLookupTable.addressLookupTable": {
      seeds: [
        k.publicKeySeed("authority", "The address of the LUT's authority"),
        k.variableSeed(
          "recentSlot",
          k.numberTypeNode("u64"),
          "The recent slot associated with the LUT"
        ),
      ],
    },
  })
);

// Update accounts.
kinobi.update(
  new k.SetAccountDiscriminatorFromFieldVisitor({
    "splAddressLookupTable.addressLookupTable": {
      field: "discriminator",
      value: k.vScalar(1),
    },
  })
);

// Update instructions.
const ataPdaDefaults = k.pdaDefault("AssociatedToken", {
  importFrom: "hooked",
  seeds: {
    owner: k.accountDefault("owner"),
    mint: k.accountDefault("mint"),
    tokenProgramId: k.accountDefault("tokenProgram")
  },
});
kinobi.update(
  new k.UpdateInstructionsVisitor({
    transferSol: {
      accounts: {
        source: { defaultsTo: k.identityDefault() },
      },
    },
    transferAllSol: {
      accounts: {
        source: { defaultsTo: k.identityDefault() },
      },
    },
    mintTokensTo: {
      accounts: {
        mintAuthority: { defaultsTo: k.identityDefault() },
      },
    },
    createAccount: {
      bytesCreatedOnChain: k.bytesFromArg("space"),
    },
    createAccountWithRent: {
      bytesCreatedOnChain: k.bytesFromArg("space"),
    },
    createAssociatedToken: {
      bytesCreatedOnChain: k.bytesFromAccount("token"),
      accounts: {
        owner: { defaultsTo: k.identityDefault() },
        ata: { defaultsTo: ataPdaDefaults },
      },
    },
    createTokenIfMissing: {
      accounts: {
        ata: { defaultsTo: ataPdaDefaults },
        token: { defaultsTo: k.accountDefault("ata") },
        owner: { defaultsTo: k.identityDefault() },
      },
    },
    createEmptyLut: {
      bytesCreatedOnChain: k.bytesFromNumber(56),
      accounts: {
        address: {
          defaultsTo: k.pdaDefault("addressLookupTable"),
        },
      },
      args: {
        bump: {
          defaultsTo: k.accountBumpDefault("address"),
        },
      },
    },
    extendLut: {
      bytesCreatedOnChain: k.resolverDefault("resolveExtendLutBytes", [
        k.dependsOnArg("addresses"),
      ]),
    },
  })
);

kinobi.update(
  new k.SetStructDefaultValuesVisitor({
    addressLookupTable: {
      padding: { ...k.vScalar(0), strategy: "omitted" },
    },
  })
);

// Wrap numbers.
kinobi.update(
  new k.SetNumberWrappersVisitor({
    "splSystem.CreateAccount.lamports": { kind: "SolAmount" },
    "splSystem.TransferSol.amount": { kind: "SolAmount" },
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(new k.RenderJavaScriptVisitor(jsDir, { prettier }));
