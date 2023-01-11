import { TransactionBuilder } from '@lorisleiva/js-core';
import { createMetaplex, generateSigner, sol } from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';

test('test example', async (t) => {
  const metaplex = await createMetaplex();
  const newAccount = generateSigner(metaplex);
  const instruction = createAccount(metaplex, {
    lamports: sol(1.5),
    space: 15,
    programId: metaplex.eddsa.createPublicKey(
      '11111111111111111111111111111111'
    ),
    payer: metaplex.payer,
    newAccount,
  });
  const foo = await TransactionBuilder.make(metaplex)
    .add(instruction)
    .sendAndConfirm();
  console.log(foo);
  t.pass();
});
