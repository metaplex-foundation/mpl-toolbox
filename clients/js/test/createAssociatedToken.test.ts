import {
  generateSigner,
  none,
  subtractAmounts,
} from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  createAssociatedToken,
  createMint,
  fetchToken,
  findAssociatedTokenPda,
  getTokenSize,
  Token,
  TokenState,
} from '../src';
import { createUmi } from './_setup';

test('it can create new associated token accounts with minimum configuration', async (t) => {
  // Given an existing mint.
  const umi = await createUmi();
  const newMint = generateSigner(umi);
  await createMint(umi, { mint: newMint }).sendAndConfirm(umi);

  // When we create a new associated token account with minimum configuration.
  await createAssociatedToken(umi, {
    mint: newMint.publicKey,
  }).sendAndConfirm(umi);

  // Then the account was created with the correct data
  // And the token account is associated to the identity.
  const ata = findAssociatedTokenPda(umi, {
    mint: newMint.publicKey,
    owner: umi.identity.publicKey,
  });
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

test('it can create new associated token accounts with maximum configuration', async (t) => {
  // Given an existing mint account and various signers.
  const umi = await createUmi();
  const payer = await generateSignerWithSol(umi);
  const payerBalance = await umi.rpc.getBalance(payer.publicKey);
  const newOwner = generateSigner(umi);
  const newMint = generateSigner(umi);
  const ata = findAssociatedTokenPda(umi, {
    mint: newMint.publicKey,
    owner: newOwner.publicKey,
  });
  await createMint(umi, { mint: newMint }).sendAndConfirm(umi);

  // When we create a new associated token account with maximum configuration.
  await createAssociatedToken(umi, {
    payer,
    mint: newMint.publicKey,
    owner: newOwner.publicKey,
    ata,
  }).sendAndConfirm(umi);

  // Then the account was created with the correct data.
  const tokenAccount = await fetchToken(umi, ata);
  const rentExemptBalance = await umi.rpc.getRent(getTokenSize());
  t.like(tokenAccount, <Token>{
    publicKey: ata,
    header: {
      owner: umi.programs.get('splToken').publicKey,
      lamports: rentExemptBalance,
      executable: false,
    },
    mint: newMint.publicKey,
    owner: newOwner.publicKey,
    amount: 0n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });

  // And the payer was charged for the creation of the account.
  const newPayerBalance = await umi.rpc.getBalance(payer.publicKey);
  t.deepEqual(
    newPayerBalance,
    subtractAmounts(payerBalance, rentExemptBalance)
  );
});
