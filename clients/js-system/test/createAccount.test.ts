import {
  createMetaplex,
  createSignerFromKeypair,
  sol,
} from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';

test('test example', async (t) => {
  const metaplex = await createMetaplex();
  const newAccount = createSignerFromKeypair(
    metaplex,
    metaplex.eddsa.generateKeypair()
  );
  const foo = createAccount(metaplex, {
    lamports: sol(1.5),
    space: 15,
    programId: metaplex.eddsa.createPublicKey(
      '11111111111111111111111111111111'
    ),
    payer: metaplex.payer,
    newAccount,
  });
  console.log(foo);
  t.pass();
});
