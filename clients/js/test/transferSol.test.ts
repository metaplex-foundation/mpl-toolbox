import {
  generateSigner,
  isEqualToAmount,
  isLessThanAmount,
  sol,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import { transferSol } from '../src';
import { createUmi } from './_setup';

test('it can create transfer SOLs', async (t) => {
  // Given two wallets A and B with 50 SOL each.
  const umi = await createUmi();
  const walletA = await generateSignerWithSol(umi, sol(50));
  const walletB = await generateSignerWithSol(umi, sol(50));
  const payerBalance = await umi.rpc.getBalance(umi.payer.publicKey);

  // When wallet A transfers 10 SOL to wallet B.
  await transactionBuilder(umi)
    .add(
      transferSol(umi, {
        source: walletA,
        destination: walletB.publicKey,
        amount: sol(10),
      })
    )
    .sendAndConfirm();

  // Then wallet A now has 40 SOL.
  const balanceA = await umi.rpc.getBalance(walletA.publicKey);
  t.true(isEqualToAmount(balanceA, sol(40)));

  // And wallet B has 60 SOL.
  const balanceB = await umi.rpc.getBalance(walletB.publicKey);
  t.true(isEqualToAmount(balanceB, sol(60)));

  // And the metaplet payer paid for the transaction.
  const newPayerBalance = await umi.rpc.getBalance(umi.payer.publicKey);
  t.true(isLessThanAmount(newPayerBalance, payerBalance));
});

test('it defaults to transferring from the identity', async (t) => {
  // Given a destination wallet with no SOL.
  const umi = await createUmi();
  const destination = generateSigner(umi);

  // And an identity wallet with 100 SOL.
  const identityBalance = await umi.rpc.getBalance(umi.identity.publicKey);
  t.true(isEqualToAmount(identityBalance, sol(100)));

  // When we transfer 10 SOL to the destination without specifying a source.
  await transactionBuilder(umi)
    .add(
      transferSol(umi, {
        destination: destination.publicKey,
        amount: sol(10),
      })
    )
    .sendAndConfirm();

  // Then the destination now has 10 SOL.
  const destinationBalance = await umi.rpc.getBalance(destination.publicKey);
  t.true(isEqualToAmount(destinationBalance, sol(10)));

  // And the identity now has 90 SOL minus the transaction fee.
  const newIdentityBalance = await umi.rpc.getBalance(umi.identity.publicKey);
  t.true(isEqualToAmount(newIdentityBalance, sol(90), sol(0.01)));
});
