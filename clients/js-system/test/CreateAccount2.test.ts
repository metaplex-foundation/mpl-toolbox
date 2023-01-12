import {
  generateSigner,
  isEqualToAmount,
  sol,
  subtractAmounts,
} from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';
import { createMetaplex } from './_setup';

test('it can create new accounts', async (t) => {
  // Given a payer and an account signer.
  const metaplex = await createMetaplex();
  const payerBalance = await metaplex.rpc.getBalance(metaplex.payer.publicKey);
  const newAccount = generateSigner(metaplex);

  // When we create a new account at this address.
  await metaplex
    .transactionBuilder()
    .add(
      createAccount(metaplex, {
        newAccount,
        lamports: sol(1.5),
        space: 42,
        programId: metaplex.programs.getSystem().address,
      })
    )
    .sendAndConfirm();

  // Then the account was created with the correct data.
  const account = await metaplex.rpc.getAccount(newAccount.publicKey);
  t.like(account, {
    exists: true,
    executable: false,
    owner: metaplex.programs.getSystem().address,
    address: newAccount.publicKey,
    lamports: sol(1.5),
    data: new Uint8Array(42),
  });

  // And the payer was charged 1.5 SOL for the creation of the account.
  const newPayerBalance = await metaplex.rpc.getBalance(
    metaplex.payer.publicKey
  );
  t.true(
    isEqualToAmount(
      newPayerBalance,
      subtractAmounts(payerBalance, sol(1.5)),
      sol(0.01) // (tolerance) Plus a bit more for the transaction fee.
    )
  );
});
