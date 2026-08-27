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

// Token-2022 support.
// Kinobi hard-codes each instruction's target program, so it cannot express a
// per-call program override. We therefore post-process the generated raw SPL
// Token instructions to give each one an optional `tokenProgram` input that
// selects the instruction's target program, defaulting to the SPL Token
// program. This lets the same instruction be sent to SPL Token or SPL Token
// 2022. Only the raw SPL Token instructions are touched (identified by their
// hard-coded `splToken` dispatch program); the Associated Token and Token
// Extras instructions already expose a `tokenProgram` account and are left
// untouched.
addTokenProgramInputToSplTokenInstructions(jsDir, prettier);

function addTokenProgramInputToSplTokenInstructions(generatedDir, prettierOptions) {
  const fs = require("fs");
  const prettierLib = require("prettier");
  const splTokenAddress = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

  // Only the raw SPL Token instructions dispatch to the `splToken` program via a
  // top-level `const programId = ...`. The ATA/extras instructions reference
  // `splToken` only as a resolved *account* default, never as their dispatch
  // program, so this anchor excludes them.
  const programIdAnchor = new RegExp(
    "const programId = context\\.programs\\.getPublicKey\\(\\s*'splToken',\\s*'" +
      splTokenAddress +
      "'\\s*\\);"
  );

  const ensurePublicKeyImport = (source) =>
    /\bpublicKey\b/.test(source.split("from '@metaplex-foundation/umi';")[0])
      ? source
      : source.replace(
          /import\s*\{([\s\S]*?)\}\s*from '@metaplex-foundation\/umi';/,
          (_match, members) =>
            `import {${members}  publicKey,\n} from '@metaplex-foundation/umi';`
        );

  const instructionsDir = path.join(generatedDir, "instructions");
  const expectedCount = 25;
  let patchedCount = 0;

  for (const file of fs.readdirSync(instructionsDir)) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const filePath = path.join(instructionsDir, file);
    const source = fs.readFileSync(filePath, "utf8");
    if (!programIdAnchor.test(source)) continue;

    let patched = source
      .replace(
        programIdAnchor,
        "const programId = input.tokenProgram\n" +
          "    ? publicKey(input.tokenProgram, false)\n" +
          `    : context.programs.getPublicKey('splToken', '${splTokenAddress}');`
      )
      .replace(
        /(export type \w+InstructionAccounts = \{\n)/,
        "$1  /** The token program to use. Defaults to the SPL Token program. */\n  tokenProgram?: PublicKey | Pda;\n"
      );
    patched = ensurePublicKeyImport(patched);
    patched = prettierLib.format(patched, {
      ...prettierOptions,
      parser: "typescript",
    });

    fs.writeFileSync(filePath, patched);
    patchedCount += 1;
  }

  if (patchedCount !== expectedCount) {
    throw new Error(
      `Token-2022 codemod patched ${patchedCount} instruction files, expected ` +
        `${expectedCount}. Kinobi output shape may have changed — re-check the ` +
        `anchors in configs/kinobi.cjs.`
    );
  }
  console.log(
    `Token-2022 codemod: added a tokenProgram input to ${patchedCount} SPL Token instructions.`
  );
}
