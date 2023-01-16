import {
  generateSigner,
  isEqualToAmount,
  sol,
  subtractAmounts,
  transactionBuilder,
} from '@lorisleiva/js-test';
import test from 'ava';
import { createAccountWithRent } from '../src';
import { createMetaplex } from './_setup';

test('it can create new accounts at the current rent-exemption price', async (t) => {
  // Given a payer and an account signer.
  const metaplex = await createMetaplex();
  const payerBalance = await metaplex.rpc.getBalance(metaplex.payer.publicKey);
  const newAccount = generateSigner(metaplex);

  // When we create a new account at this address
  // and let the program calculate the rent-exemption price.
  await transactionBuilder(metaplex)
    .add(
      createAccountWithRent(metaplex, {
        newAccount,
        space: 4200,
        programId: metaplex.programs.getSystem().address,
      })
    )
    .sendAndConfirm();

  // Then the account was created with the correct data and the correct lamports.
  const rentBalance = await metaplex.rpc.getRent(4200);
  const account = await metaplex.rpc.getAccount(newAccount.publicKey);
  t.like(account, {
    exists: true,
    executable: false,
    owner: metaplex.programs.getSystem().address,
    address: newAccount.publicKey,
    lamports: rentBalance,
    data: new Uint8Array(4200),
  });

  // And the payer was charged the appropriate rent-exemption
  // for the creation of the account.
  const newPayerBalance = await metaplex.rpc.getBalance(
    metaplex.payer.publicKey
  );
  t.true(
    isEqualToAmount(
      newPayerBalance,
      subtractAmounts(payerBalance, rentBalance),
      sol(0.0001) // (tolerance) Plus a bit more for the transaction fee.
    )
  );
});
