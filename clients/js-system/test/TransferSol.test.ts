import {
  generateSignerWithSol,
  isEqualToAmount,
  isLessThanAmount,
  sol,
} from '@lorisleiva/js-test';
import test from 'ava';
import { transferSol } from '../src';
import { createMetaplex } from './_setup';

test('it can create transfer SOLs', async (t) => {
  // Given two wallets A and B with 50 SOL each.
  const metaplex = await createMetaplex();
  const walletA = await generateSignerWithSol(metaplex, sol(50));
  const walletB = await generateSignerWithSol(metaplex, sol(50));
  const payerBalance = await metaplex.rpc.getBalance(metaplex.payer.publicKey);

  // When wallet A transfers 10 SOL to wallet B.
  await metaplex
    .transactionBuilder()
    .add(
      transferSol(metaplex, {
        from: walletA,
        to: walletB.publicKey,
        lamports: sol(10),
      })
    )
    .sendAndConfirm();

  // Then wallet A now has 40 SOL.
  const balanceA = await metaplex.rpc.getBalance(walletA.publicKey);
  t.true(isEqualToAmount(balanceA, sol(40)));

  // And wallet B has 60 SOL.
  const balanceB = await metaplex.rpc.getBalance(walletB.publicKey);
  t.true(isEqualToAmount(balanceB, sol(60)));

  // And the metaplet payer paid for the transaction.
  const newPayerBalance = await metaplex.rpc.getBalance(
    metaplex.payer.publicKey
  );
  t.true(isLessThanAmount(newPayerBalance, payerBalance));
});
