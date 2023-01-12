import {
  base58,
  createMetaplex,
  generateSigner,
  sol,
} from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';

test('test example', async (t) => {
  // Given
  const metaplex = await createMetaplex();
  const newAccount = generateSigner(metaplex);

  // When
  const result = await metaplex
    .transactionBuilder()
    .add(
      createAccount(metaplex, {
        lamports: sol(1.5),
        space: 42,
        programId: metaplex.eddsa.createPublicKey(
          '11111111111111111111111111111111'
        ),
        payer: metaplex.payer,
        newAccount,
      })
    )
    .sendAndConfirm();
  console.log(base58.deserialize(result.signature)[0]);

  // Then
  const account = await metaplex.rpc.getAccount(newAccount.publicKey);
  t.deepEqual(account, {
    exists: true,
    lamports: sol(1.5),
  });
});
