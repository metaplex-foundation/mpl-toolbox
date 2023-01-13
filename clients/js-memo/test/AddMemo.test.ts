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
  const params = [
    base58Signature,
    { commitment: 'confirmed', maxSupportedTransactionVersion: 0 },
  ];
  const rpcResult: any = await metaplex.rpc.call('getTransaction', params, {
    id: '123', // TODO: Fix on web3js RPC.
  });
  console.log(
    base58Signature,
    rpcResult,
    rpcResult.result.meta,
    rpcResult.result.transaction,
    rpcResult.result.transaction.message.instructions
  );
  t.pass();
});
