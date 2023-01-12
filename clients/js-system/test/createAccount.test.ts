import { generateSigner, sol } from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';
import { createMetaplex } from './_setup';

test('it can create new accounts', async (t) => {
  // Given an account signer.
  const metaplex = await createMetaplex();
  const newAccount = generateSigner(metaplex);

  // When we create a new account at this address.
  await metaplex
    .transactionBuilder()
    .add(
      createAccount(metaplex, {
        lamports: sol(1.5),
        space: 42,
        programId: metaplex.programs.get('splSystem').address,
        payer: metaplex.payer,
        newAccount,
      })
    )
    .sendAndConfirm();

  // Then the account was created with the correct data.
  const account = await metaplex.rpc.getAccount(newAccount.publicKey);
  t.like(account, {
    exists: true,
    executable: false,
    owner: metaplex.programs.get('splSystem').address,
    address: newAccount.publicKey,
    lamports: sol(1.5),
    data: new Uint8Array(42),
  });
});
