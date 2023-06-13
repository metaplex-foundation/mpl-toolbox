import {
  generateSigner,
  none,
  publicKey,
  some,
} from '@metaplex-foundation/umi';
import test from 'ava';
import {
  createMintWithAssociatedToken,
  fetchMint,
  fetchToken,
  findAssociatedTokenPda,
  Mint,
  Token,
  TokenState,
} from '../src';
import { createUmi } from './_setup';

test('it can create a new mint and token account with no tokens', async (t) => {
  // Given a mint address and an owner address.
  const umi = await createUmi();
  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;

  // When we create a new mint and token account without specifying an amount.
  await createMintWithAssociatedToken(umi, { mint, owner }).sendAndConfirm(umi);

  // Then it created a new mint account with a supply of 0.
  const mintAccount = await fetchMint(umi, mint.publicKey);
  t.like(mintAccount, <Mint>{
    publicKey: publicKey(mint),
    mintAuthority: some(publicKey(umi.identity)),
    supply: 0n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(publicKey(umi.identity)),
  });

  // And a new associated token account with no tokens.
  const [ata] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner });
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: ata,
    mint: publicKey(mint),
    owner: publicKey(owner),
    amount: 0n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });
});

test('it can create a new mint and token account with a single token', async (t) => {
  // Given a mint address and an owner address.
  const umi = await createUmi();
  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;

  // When we create a new mint and token account with a single token.
  await createMintWithAssociatedToken(umi, {
    mint,
    owner,
    amount: 1,
  }).sendAndConfirm(umi);

  // Then it created a new mint account with a supply of 1.
  const mintAccount = await fetchMint(umi, mint.publicKey);
  t.like(mintAccount, <Mint>{
    publicKey: publicKey(mint),
    mintAuthority: some(publicKey(umi.identity)),
    supply: 1n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(publicKey(umi.identity)),
  });

  // And a new associated token account with one token.
  const [ata] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner });
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: ata,
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

test('it can create a new mint and token account with many tokens', async (t) => {
  // Given a mint address and an owner address.
  const umi = await createUmi();
  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;

  // When we create a new mint and token account with 42 tokens.
  await createMintWithAssociatedToken(umi, {
    mint,
    owner,
    amount: 42,
  }).sendAndConfirm(umi);

  // Then it created a new mint account with a supply of 42.
  const mintAccount = await fetchMint(umi, mint.publicKey);
  t.like(mintAccount, <Mint>{
    publicKey: publicKey(mint),
    mintAuthority: some(publicKey(umi.identity)),
    supply: 42n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(publicKey(umi.identity)),
  });

  // And a new associated token account with 42 tokens.
  const [ata] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner });
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: ata,
    mint: publicKey(mint),
    owner: publicKey(owner),
    amount: 42n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });
});

test('it can create a new mint and token account with decimals', async (t) => {
  // Given a mint address and an owner address.
  const umi = await createUmi();
  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;

  // When we create a new mint and token account with 42 tokens and one decimal.
  await createMintWithAssociatedToken(umi, {
    mint,
    owner,
    amount: 42,
    decimals: 1,
  }).sendAndConfirm(umi);

  // Then it created a new mint account with a supply of 42 and one decimal.
  const mintAccount = await fetchMint(umi, mint.publicKey);
  t.like(mintAccount, <Mint>{
    publicKey: publicKey(mint),
    mintAuthority: some(publicKey(umi.identity)),
    supply: 42n,
    decimals: 1,
    isInitialized: true,
    freezeAuthority: some(publicKey(umi.identity)),
  });

  // And a new associated token account with 42 tokens.
  const [ata] = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner });
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: ata,
    mint: publicKey(mint),
    owner: publicKey(owner),
    amount: 42n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });
});

test('it defaults to using the identity as the owner', async (t) => {
  // Given a mint address.
  const umi = await createUmi();
  const mint = generateSigner(umi);

  // When we create a new mint and token account without specifying an owner.
  await createMintWithAssociatedToken(umi, { mint }).sendAndConfirm(umi);

  // Then it created a new mint account with a supply of 0.
  const mintAccount = await fetchMint(umi, mint.publicKey);
  t.like(mintAccount, <Mint>{
    publicKey: publicKey(mint),
    mintAuthority: some(publicKey(umi.identity)),
    supply: 0n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(publicKey(umi.identity)),
  });

  // And a new associated token account for the identity.
  const [ata] = findAssociatedTokenPda(umi, {
    mint: mint.publicKey,
    owner: umi.identity.publicKey,
  });
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: ata,
    mint: publicKey(mint),
    owner: publicKey(umi.identity),
    amount: 0n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });
});
