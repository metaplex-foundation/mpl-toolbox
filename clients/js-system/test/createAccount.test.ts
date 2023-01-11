import { createMetaplex, generateSigner, sol } from '@lorisleiva/js-test';
import test from 'ava';
import { createAccount } from '../src';

test('test example', async (t) => {
  const metaplex = await createMetaplex();
  const account = await metaplex.rpc.getAccount(metaplex.payer.publicKey);
  console.log(account);

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
  const foo = await metaplex
    .transactionBuilder()
    .add(instruction)
    .sendAndConfirm();
  console.log(foo);
  t.pass();
});
