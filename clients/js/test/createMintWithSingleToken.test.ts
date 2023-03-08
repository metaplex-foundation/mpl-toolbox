import {
  generateSigner,
  none,
  publicKey,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import test from 'ava';
import {
  createMintWithSingleToken,
  fetchMint,
  fetchToken,
  findAssociatedTokenPda,
  Mint,
  Token,
  TokenState,
} from '../src';
import { createUmi } from './_setup';

test('it can create a new mint and token account with a single token', async (t) => {
  // Given a mint address and an owner address.
  const umi = await createUmi();
  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;

  // When we create a new mint and token account with a single token.
  await transactionBuilder(umi)
    .add(createMintWithSingleToken(umi, { mint, owner }))
    .sendAndConfirm();

  // Then it created a new mint account.
  const mintAccount = await fetchMint(umi, mint.publicKey);
  t.like(mintAccount, <Mint>{
    publicKey: publicKey(mint),
    mintAuthority: some(publicKey(umi.identity)),
    supply: 1n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(publicKey(umi.identity)),
  });

  // And a new associated token account with a single token.
  const ata = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner });
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: publicKey(ata),
    mint: publicKey(mint),
    owner: publicKey(owner),
    amount: 1n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });
});
