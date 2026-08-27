# JavaScript client for Mpl Toolbox

A Umi-compatible JavaScript library for the project.

## Getting started

1. First, if you're not already using Umi, [follow these instructions to install the Umi framework](https://github.com/metaplex-foundation/umi/blob/main/docs/installation.md).
2. Next, install this library using the package manager of your choice.
   ```sh
   npm install @metaplex-foundation/mpl-toolbox
   ```
2. Finally, register the library with your Umi instance like so.
   ```ts
   import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';
   umi.use(mplToolbox());
   ```

You can learn more about this library's API by reading its generated [TypeDoc documentation](https://mpl-toolbox-js-docs.vercel.app).

## Token-2022 support

Every SPL Token instruction accepts an optional `tokenProgram` input. It
defaults to the SPL Token program, so existing code is unaffected. Pass the
SPL Token 2022 program id — registered by the `mplToolbox()` plugin under the
name `splToken2022` — to target Token Extensions instead:

```ts
import { mintTokensTo } from '@metaplex-foundation/mpl-toolbox';

const tokenProgram = umi.programs.getPublicKey('splToken2022');

await mintTokensTo(umi, {
  mint,
  token,
  amount: 42,
  tokenProgram, // omit to use the classic SPL Token program
}).sendAndConfirm(umi);
```

The same `tokenProgram` option is available on the higher-level helpers
`createMint`, `createToken`, and `createMintWithAssociatedToken`. When creating
associated token accounts under Token-2022, `createAssociatedToken` and
`createIdempotentAssociatedToken` already accept a `tokenProgram` account — pass
the matching `tokenProgramId` to `findAssociatedTokenPda` so the address
derivation lines up:

```ts
const tokenProgram = umi.programs.getPublicKey('splToken2022');

await createAssociatedToken(umi, { mint, tokenProgram }).sendAndConfirm(umi);

const [ata] = findAssociatedTokenPda(umi, {
  mint,
  owner: umi.identity.publicKey,
  tokenProgramId: tokenProgram,
});
```

> **Note:** the `createTokenIfMissing` instruction from the `mpl-token-extras`
> on-chain program validates the classic SPL Token program and does not support
> Token-2022. For an idempotent "create the associated token account if it is
> missing" flow under Token-2022, use `createIdempotentAssociatedToken` with the
> Token-2022 `tokenProgram` instead.

## Contributing

Check out the [Contributing Guide](./CONTRIBUTING.md) the learn more about how to contribute to this library.
