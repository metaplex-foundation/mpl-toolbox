import {
  ACCOUNT_HEADER_SIZE,
  generateSigner,
  isEqualToAmount,
  sol,
  subtractAmounts,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import test from 'ava';
import { createAccount } from '../src';
import { createUmi } from './_setup';

test('it can create new accounts', async (t) => {
  // Given a payer and an account signer.
  const umi = await createUmi();
  const payerBalance = await umi.rpc.getBalance(umi.payer.publicKey);
  const newAccount = generateSigner(umi);

  // When we create a new account at this address.
  await createAccount(umi, {
    newAccount,
    lamports: sol(1.5),
    space: 42,
    programId: umi.programs.get('splSystem').publicKey,
  }).sendAndConfirm(umi);

  // Then the account was created with the correct data.
  const account = await umi.rpc.getAccount(newAccount.publicKey);
  t.like(account, {
    exists: true,
    executable: false,
    owner: umi.programs.get('splSystem').publicKey,
    publicKey: newAccount.publicKey,
    lamports: sol(1.5),
    data: new Uint8Array(42),
  });

  // And the payer was charged 1.5 SOL for the creation of the account.
  const newPayerBalance = await umi.rpc.getBalance(umi.payer.publicKey);
  t.true(
    isEqualToAmount(
      newPayerBalance,
      subtractAmounts(payerBalance, sol(1.5)),
      sol(0.01) // (tolerance) Plus a bit more for the transaction fee.
    )
  );
});

test('it knows how much space will be created on chain', async (t) => {
  // Given a transaction builder creating a new account with 42 bytes of data.
  const umi = await createUmi();
  const builder = transactionBuilder().add(
    createAccount(umi, {
      newAccount: generateSigner(umi),
      lamports: sol(1.5),
      space: 42,
      programId: umi.programs.get('splSystem').publicKey,
    })
  );

  // When we get its bytes and rent created on chain.
  const bytes = builder.getBytesCreatedOnChain();
  const rent = await builder.getRentCreatedOnChain(umi);

  // Then the bytes are 42 plus the account header size.
  t.is(bytes, 42 + ACCOUNT_HEADER_SIZE);

  // And the rent reflects that.
  const expectedRent = await umi.rpc.getRent(42);
  t.deepEqual(rent, expectedRent);
});
