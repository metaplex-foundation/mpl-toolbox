import { generateSigner, none } from '@metaplex-foundation/umi';
import test from 'ava';
import {
  createIdempotentAssociatedToken,
  createMint,
  fetchToken,
  findAssociatedTokenPda,
  getTokenSize,
  Token,
  TokenState,
} from '../src';
import { createUmi } from './_setup';

test('it can create a new associated token account', async (t) => {
  // Given an existing mint.
  const umi = await createUmi();
  const newMint = generateSigner(umi);
  await createMint(umi, { mint: newMint }).sendAndConfirm(umi);
  const [ata] = findAssociatedTokenPda(umi, {
    mint: newMint.publicKey,
    owner: umi.identity.publicKey,
  });

  // When we create its associated token account idempotently.
  await createIdempotentAssociatedToken(umi, {
    mint: newMint.publicKey,
    owner: umi.identity.publicKey,
    ata,
  }).sendAndConfirm(umi);

  // Then the account was created with the correct data
  // And the token account is associated to the identity.
  const tokenAccount = await fetchToken(umi, ata);
  t.like(tokenAccount, <Token>{
    publicKey: ata,
    header: {
      owner: umi.programs.get('splToken').publicKey,
      lamports: await umi.rpc.getRent(getTokenSize()),
      executable: false,
    },
    mint: newMint.publicKey,
    owner: umi.identity.publicKey,
    amount: 0n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });
});

test('it does not fail when the associated token account already exists', async (t) => {
  // Given an existing mint and an already-created associated token account.
  const umi = await createUmi();
  const newMint = generateSigner(umi);
  await createMint(umi, { mint: newMint }).sendAndConfirm(umi);
  const [ata] = findAssociatedTokenPda(umi, {
    mint: newMint.publicKey,
    owner: umi.identity.publicKey,
  });
  await createIdempotentAssociatedToken(umi, {
    mint: newMint.publicKey,
    owner: umi.identity.publicKey,
    ata,
  }).sendAndConfirm(umi);

  // When we create it again idempotently.
  // Then the instruction does not throw, unlike the non-idempotent variant.
  await t.notThrowsAsync(
    createIdempotentAssociatedToken(umi, {
      mint: newMint.publicKey,
      owner: umi.identity.publicKey,
      ata,
    }).sendAndConfirm(umi)
  );

  // And the token account still exists and is unchanged.
  const tokenAccount = await fetchToken(umi, ata);
  t.is(tokenAccount.mint, newMint.publicKey);
  t.is(tokenAccount.owner, umi.identity.publicKey);
});
