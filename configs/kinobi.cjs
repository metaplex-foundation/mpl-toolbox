// Generates the Umi client for the 8 core programs with Kinobi 0.20 (the
// Codama-era release). The Token-2022 client is generated separately by
// configs/kinobi-token2022.cjs. Output is left unformatted here and normalized
// by the repo's Prettier in the generate:clients script.
const path = require("path");
const k = require("@metaplex-foundation/kinobi");

const idlDir = path.join(__dirname, "..", "idls");
const idl = (name) => require(path.join(idlDir, name));

const kinobi = k.createFromIdl(idl("spl_system.json"), [
  idl("spl_memo.json"),
  idl("spl_token.json"),
  idl("spl_associated_token.json"),
  idl("spl_address_lookup_table.json"),
  idl("spl_compute_budget.json"),
  idl("mpl_system_extras.json"),
  idl("mpl_token_extras.json"),
]);

kinobi.update(
  k.updateProgramsVisitor({
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

kinobi.update(
  k.updateAccountsVisitor({
    "splToken.mint": { discriminators: [k.sizeDiscriminatorNode(82)] },
    "splToken.token": { discriminators: [k.sizeDiscriminatorNode(165)] },
    "splToken.multisig": { discriminators: [k.sizeDiscriminatorNode(355)] },
    "splAddressLookupTable.addressLookupTable": {
      seeds: [
        k.variablePdaSeedNode(
          "authority",
          k.publicKeyTypeNode(),
          "The address of the LUT's authority"
        ),
        k.variablePdaSeedNode(
          "recentSlot",
          k.numberTypeNode("u64"),
          "The recent slot associated with the LUT"
        ),
      ],
    },
  })
);

kinobi.update(
  k.setAccountDiscriminatorFromFieldVisitor({
    "splAddressLookupTable.addressLookupTable": {
      field: "discriminator",
      value: k.numberValueNode(1),
    },
  })
);

const ataPda = k.pdaValueNode(k.pdaLinkNode("associatedToken", "hooked"), [
  k.pdaSeedValueNode("owner", k.accountValueNode("owner")),
  k.pdaSeedValueNode("mint", k.accountValueNode("mint")),
  k.pdaSeedValueNode("tokenProgramId", k.accountValueNode("tokenProgram")),
]);

kinobi.update(
  k.updateInstructionsVisitor({
    transferSol: { accounts: { source: { defaultValue: k.identityValueNode() } } },
    transferAllSol: {
      accounts: { source: { defaultValue: k.identityValueNode() } },
    },
    mintTokensTo: {
      accounts: { mintAuthority: { defaultValue: k.identityValueNode() } },
    },
    createAccount: {
      byteDeltas: [k.instructionByteDeltaNode(k.argumentValueNode("space"))],
    },
    createAccountWithRent: {
      byteDeltas: [k.instructionByteDeltaNode(k.argumentValueNode("space"))],
    },
    createAssociatedToken: {
      byteDeltas: [
        k.instructionByteDeltaNode(k.accountLinkNode("token"), {
          withHeader: true,
        }),
      ],
      accounts: {
        owner: { defaultValue: k.identityValueNode() },
        ata: { defaultValue: ataPda },
      },
    },
    createTokenIfMissing: {
      accounts: {
        ata: { defaultValue: ataPda },
        token: { defaultValue: k.accountValueNode("ata") },
        owner: { defaultValue: k.identityValueNode() },
      },
    },
    createEmptyLut: {
      byteDeltas: [k.instructionByteDeltaNode(k.numberValueNode(56))],
      accounts: {
        address: { defaultValue: k.pdaValueNode("addressLookupTable") },
      },
      arguments: { bump: { defaultValue: k.accountBumpValueNode("address") } },
    },
    extendLut: {
      byteDeltas: [
        k.instructionByteDeltaNode(
          k.resolverValueNode("resolveExtendLutBytes", {
            dependsOn: [k.argumentValueNode("addresses")],
          })
        ),
      ],
    },
  })
);

kinobi.update(
  k.setStructDefaultValuesVisitor({
    addressLookupTable: { padding: k.numberValueNode(0) },
  })
);

kinobi.update(
  k.setNumberWrappersVisitor({
    "splSystem.CreateAccount.lamports": { kind: "SolAmount" },
    "splSystem.TransferSol.amount": { kind: "SolAmount" },
  })
);

const jsDir = path.join(__dirname, "..", "clients", "js", "src", "generated");
kinobi.accept(k.renderJavaScriptVisitor(jsDir, { formatCode: false }));
