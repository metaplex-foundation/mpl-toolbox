import { createMetaplex, generateSigner, sol } from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';

test('test example', async (t) => {
  // Given
  const metaplex = await createMetaplex();
  const newAccount = generateSigner(metaplex);

  // When
  await metaplex
    .transactionBuilder()
    .add(
      createAccount(metaplex, {
        lamports: sol(1.5),
        space: 15,
        programId: metaplex.eddsa.createPublicKey(
          '11111111111111111111111111111111'
        ),
        payer: metaplex.payer,
        newAccount,
      })
    )
    .sendAndConfirm();

  // Then
  const account = await metaplex.rpc.getAccount(newAccount.publicKey);
  t.deepEqual(account, {
    exists: true,
    lamports: sol(1.5),
  });
});
