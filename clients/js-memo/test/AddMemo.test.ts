import { base58, transactionBuilder } from '@lorisleiva/js-test';
import test from 'ava';
import { addMemo } from '../src';
import { createMetaplex } from './_setup';

test('it can add a memo to a transaction', async (t) => {
  // Given a Metaplex context.
  const metaplex = await createMetaplex();

  // When we add a memo to a transaction.
  const { signature } = await transactionBuilder(metaplex)
    .add(addMemo(metaplex, { memo: 'Hello world!' }))
    .sendAndConfirm();

  // Then
  const base58Signature = base58.deserialize(signature)[0];

  const client = (metaplex.rpc as any).connection._rpcClient;
  const foo = await new Promise((resolve, reject) => {
    const callback = (error: any, result: any) => {
      console.log({ error, result });
      return error ? reject(error) : resolve(result);
    };
    client.request('getTransaction', [base58Signature], callback);
  });

  // const foo = await metaplex.rpc.call('getTransaction', [base58Signature]);
  console.log(base58Signature, foo);
  t.pass();
});
