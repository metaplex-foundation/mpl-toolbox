import { createMetaplex } from '@lorisleiva/js-core';
import { generateSigner, sol, testPlugins } from '@lorisleiva/js-test';
import { Connection, PublicKey } from '@solana/web3.js';
import test from 'ava';
import { createAccount } from '../src';

async function customMetaplex() {
  const mx = createMetaplex().use(
    testPlugins('http://127.0.0.1:8899', { commitment: 'confirmed' })
  );
  console.log('here', process.env.NODE_ENV);
  const connection = (mx.rpc as any).connection as Connection;
  const sig = await connection.requestAirdrop(
    new PublicKey(mx.payer.publicKey.bytes),
    100_000_000_000
  );
  await connection.confirmTransaction({
    signature: sig,
    ...(await connection.getLatestBlockhash()),
  });
  // await mx.rpc.airdrop(mx.payer.publicKey, sol(100), {
  //   commitment: 'finalized',
  // });
  return mx;
}

test('test example', async (t) => {
  const metaplex = await customMetaplex();
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
