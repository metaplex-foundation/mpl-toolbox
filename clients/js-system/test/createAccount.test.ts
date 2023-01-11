import { createMetaplex, createSignerFromKeypair, sol } from '@lorisleiva/js';
import test from 'ava';
import { createAccount } from '../src';

test('test example', (t) => {
  const metaplex = createMetaplex('http://localhost:8899');
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
  t.true(typeof foo === 'function');
});
