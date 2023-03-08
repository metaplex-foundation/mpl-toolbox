import {
  generateSigner,
  none,
  subtractAmounts,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  createMint,
  createToken,
  fetchToken,
  getTokenSize,
  Token,
  TokenState,
} from '../src';
import { createUmi } from './_setup';

test('it can create new token accounts with minimum configuration', async (t) => {
  // Given a payer, an account signer and an existing mint.
  const umi = await createUmi();
  const payer = await generateSignerWithSol(umi);
  const payerBalance = await umi.rpc.getBalance(payer.publicKey);
  const newMint = generateSigner(umi);
  const newToken = generateSigner(umi);
  await transactionBuilder(umi)
    .add(createMint(umi, { mint: newMint }))
    .sendAndConfirm();

  // When we create a new token account with minimum configuration.
  await transactionBuilder(umi)
    .add(
      createToken(
        { ...umi, payer }, // <- Our custom payer only pays for the Token storage.
        { token: newToken, mint: newMint.publicKey }
      )
    )
    .sendAndConfirm();

  // Then the account was created with the correct data.
  const tokenAccount = await fetchToken(umi, newToken.publicKey);
  const rentExemptBalance = await umi.rpc.getRent(getTokenSize());
  t.like(tokenAccount, <Token>{
    publicKey: newToken.publicKey,
    header: {
      owner: umi.programs.get('splToken').publicKey,
      lamports: rentExemptBalance,
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

  // And the payer was charged for the creation of the account.
  const newPayerBalance = await umi.rpc.getBalance(payer.publicKey);
  t.deepEqual(
    newPayerBalance,
    subtractAmounts(payerBalance, rentExemptBalance)
  );
});

test('it can create new token accounts with maximum configuration', async (t) => {
  // Given an existing mint account and new owner and token signers.
  const umi = await createUmi();
  const newOwner = generateSigner(umi);
  const newMint = generateSigner(umi);
  const newToken = generateSigner(umi);
  await transactionBuilder(umi)
    .add(createMint(umi, { mint: newMint }))
    .sendAndConfirm();

  // When we create a new token account with maximum configuration.
  await transactionBuilder(umi)
    .add(
      createToken(umi, {
        token: newToken,
        mint: newMint.publicKey,
        owner: newOwner.publicKey,
      })
    )
    .sendAndConfirm();

  // Then the account was created with the correct data.
  const tokenAccount = await fetchToken(umi, newToken.publicKey);
  const rentExemptBalance = await umi.rpc.getRent(getTokenSize());
  t.like(tokenAccount, <Token>{
    publicKey: newToken.publicKey,
    header: {
      owner: umi.programs.get('splToken').publicKey,
      lamports: rentExemptBalance,
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
});
