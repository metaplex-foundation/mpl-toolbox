import {
  generateSigner,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import { createLut, extendLut, findAddressLookupTablePda } from '../src';
import { createUmi } from './_setup';

test('it can create a new empty LUT with minimum configuration', async (t) => {
  // Given
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });

  const addresses = Array(30)
    .fill(0)
    .map(() => generateSigner(umi).publicKey);

  // When
  const builder = transactionBuilder(umi)
    .add(createLut(umi, { recentSlot }))
    .add(extendLut(umi, { address: lut, addresses }));

  const txSize = umi.transactions.serialize(
    builder.setBlockhash('11111111111111111111111111111111').build()
  ).length;

  console.log({
    txSize,
    minimumTransactionsRequired: builder.minimumTransactionsRequired(),
  });
  await builder.sendAndConfirm();

  t.pass();
});
