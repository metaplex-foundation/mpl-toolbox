# Token-2022 Support (JS Client) — Implementation Record

**Status:** Implemented and verified on branch `claude/token22-support-plan-ed7470`.

**Goal:** Let every SPL-Token instruction in the `@metaplex-foundation/mpl-toolbox` JS client target either the SPL Token program (default) or the SPL Token 2022 program, via an optional `tokenProgram` input.

**Scope:** JS client only. No Rust/on-chain changes. Kinobi stays pinned at `^0.16.0`.

## Approach: post-generation codemod (chosen over hooked wrappers / render-decorator)

Kinobi hard-codes each instruction's dispatch `programId` from its parent program node and offers **no** per-call program override — verified against live generation runs on Kinobi 0.16.16 **and** the latest Codama renderers (both still emit `const programId = context.programs.getPublicKey('splToken', '…')`). The IDL cannot express a runtime-chosen target program either: adding a `tokenProgram` *account* only appends a trailing `AccountMeta` (dispatch stays SPL Token, and SPL Token treats trailing accounts as multisig signers — unsafe for authority instructions); cloning the program under the token22 address yields a *parallel* instruction family, not one ix + input.

Three viable ways to make Kinobi emit the override were verified live; the **post-generation codemod** was chosen because it is the least coupled to Kinobi internals (the stock `RenderJavaScriptVisitor` runs unchanged — validation and folder-clean intact) and is version-tolerant across the 0.16.x range. The render-decorator variant (subclass `GetJavaScriptRenderMapVisitor`, override `render()`) produces byte-identical output but must bypass `RenderJavaScriptVisitor` and re-add its folder-clean/validation, coupling to more internal symbols. Hooked wrappers avoid Kinobi coupling entirely but add a second set of functions plus `index.ts` export-shadowing.

## What was implemented

### 1. Codemod in `configs/kinobi.cjs`

After `kinobi.accept(new k.RenderJavaScriptVisitor(jsDir, { prettier }))`, a `addTokenProgramInputToSplTokenInstructions(jsDir, prettier)` step rewrites exactly the raw SPL-Token instruction files:

- **Selection anchor:** `const programId = context.programs.getPublicKey('splToken', 'TokenkegQ…')`. Only the 25 raw SPL-Token instructions dispatch to `splToken` this way; ATA/extras files reference `splToken` only as an *account* default, so they are excluded.
- **Edits per file:** (a) add `tokenProgram?: PublicKey | Pda` to the `*InstructionAccounts` type; (b) replace the `programId` line with `input.tokenProgram ? publicKey(input.tokenProgram, false) : context.programs.getPublicKey('splToken', '…')`; (c) ensure `publicKey` is imported from `@metaplex-foundation/umi`; (d) reformat with prettier (the same 2.8.1 Kinobi uses, so only the intended lines change).
- **Build-time guard:** throws unless exactly **25** files are patched, so a future Kinobi output shift fails `pnpm generate` instead of silently no-op'ing.

The 25 instructions: `initializeMint`, `initializeMint2`, `initializeToken`/`2`/`3`, `initializeMultisig`/`2`, `transferTokens`(`Checked`), `approveTokenDelegate`(`Checked`), `revokeTokenDelegate`, `setAuthority`, `mintTokensTo`(`Checked`), `burnToken`(`Checked`), `closeToken`, `freezeToken`, `thawToken`, `syncNative`, `getTokenDataSize`, `initializeImmutableOwner`, `amountToUiAmount`, `uiAmountToAmount`.

The regenerated files under `clients/js/src/generated/instructions/` are committed (the client is shipped generated).

### 2. Convenience helpers thread `tokenProgram`

`createMint`, `createToken`, and `createMintWithAssociatedToken` gained an optional `tokenProgram?: PublicKey` (default = the registered `splToken`), passed to `createAccountWithRent` (account owner), the generated init/mint instructions, `createAssociatedToken`, and the `findAssociatedTokenPda` derivation (`tokenProgramId`). They call the generated instructions directly — no wrappers, no `index.ts` changes.

### 3. Already token22-capable, unchanged

`createAssociatedToken`, `createIdempotentAssociatedToken`, `recoverNestedAssociatedToken` (ATA) and `createTokenIfMissing` (extras) already expose a `tokenProgram` account. The umi plugin already registers `splToken2022`. `findAssociatedTokenPda` already takes `tokenProgramId`.

### 4. Tests — `clients/js/test/token2022.test.ts`

`programId` override defaults (build-only), plus end-to-end token22 flows for createMint, createToken, mintTokensTo, transferTokens, closeToken, createAssociatedToken, createIdempotentAssociatedToken, and createMintWithAssociatedToken.

### 5. Docs

`clients/js/README.md` gains a "Token-2022 support" section, including the note that on-chain `createTokenIfMissing` remains spl-token-only (use `createIdempotentAssociatedToken` for token22).

## Verification

- Baseline: regenerating with the unmodified config produced a **zero diff** vs the committed generated files (Kinobi 0.16.0), so the codemod's diff is purely its own.
- Codemod: `pnpm generate` reports "patched 25"; `git diff` touches exactly the 25 instruction files, three clean hunks each, `tokenProgram` never enters `resolvedAccounts`.
- `pnpm build` (tsc), `pnpm format` (prettier), `pnpm lint` (eslint) all pass.
- Tests: the 7 token22 tests pass, and all token-instruction existing tests pass (36/36 in the combined run) against a local validator with Token-2022 + both extras programs. The only two failures in the *full* suite — `getMintGpaBuilder` (an Agave 3.0 RPC mint-filter byte-length quirk, confirmed failing identically on the base commit) and `deactivateLut` (a LUT-slot timing flake that passes in isolation) — are pre-existing and unrelated to token instructions.

## Maintenance note

The codemod is anchored on Kinobi's rendered output. On any Kinobi upgrade, the `=== 25` guard will fail the build if the anchors drift — update the anchors in `configs/kinobi.cjs` accordingly.
