import {
  generateSigner,
  isEqualToAmount,
  none,
  sol,
  some,
  subtractAmounts,
} from '@metaplex-foundation/umi';
import test from 'ava';
import { createMint, fetchMint, getMintSize, Mint } from '../src';
import { createUmi } from './_setup';

test('it can create new mint accounts with minimum configuration', async (t) => {
  // Given a payer and an account signer.
  const umi = await createUmi();
  const payerBalance = await umi.rpc.getBalance(umi.payer.publicKey);
  const newAccount = generateSigner(umi);

  // When we create a new mint account at this address with no additional configuration.
  await createMint(umi, { mint: newAccount }).sendAndConfirm(umi);

  // Then the account was created with the correct data.
  const mintAccount = await fetchMint(umi, newAccount.publicKey);
  const rentExemptBalance = await umi.rpc.getRent(getMintSize());
  t.like(mintAccount, <Mint>{
    publicKey: newAccount.publicKey,
    header: {
      owner: umi.programs.get('splToken').publicKey,
      lamports: rentExemptBalance,
    },
    mintAuthority: some(umi.identity.publicKey),
    supply: 0n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(umi.identity.publicKey),
  });

  // And the payer was charged for the creation of the account.
  const newPayerBalance = await umi.rpc.getBalance(umi.payer.publicKey);
  t.true(
    isEqualToAmount(
      newPayerBalance,
      subtractAmounts(payerBalance, rentExemptBalance),
      sol(0.0001) // (tolerance) Plus a bit more for the transaction fee.
    )
  );
});

test('it can create new mint accounts with maximum configuration', async (t) => {
  // Given an account signer and a mint authority.
  const umi = await createUmi();
  const newAccount = generateSigner(umi);
  const mintAuthority = generateSigner(umi).publicKey;

  // When we create a new mint account with all configuration options.
  await createMint(umi, {
    mint: newAccount,
    decimals: 9,
    mintAuthority,
    freezeAuthority: none(),
  }).sendAndConfirm(umi);

  // Then the account was created with the correct data.
  const mintAccount = await fetchMint(umi, newAccount.publicKey);
  const rentExemptBalance = await umi.rpc.getRent(getMintSize());
  t.like(mintAccount, <Mint>{
    publicKey: newAccount.publicKey,
    header: {
      owner: umi.programs.get('splToken').publicKey,
      lamports: rentExemptBalance,
    },
    mintAuthority: some(mintAuthority),
    supply: 0n,
    decimals: 9,
    isInitialized: true,
    freezeAuthority: none(),
  });
});
