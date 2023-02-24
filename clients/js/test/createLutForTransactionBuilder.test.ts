import {
  generateSigner,
  transactionBuilder,
  TransactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import { createLut, extendLut, findAddressLookupTablePda } from '../src';
import { createUmi } from './_setup';

export type CreateLutForTransactionBuilderResponse = {
  createLutBuilders: TransactionBuilder[];
  builder: TransactionBuilder;
  closeLutBuilders: TransactionBuilder[];
};

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

  console.log({
    getTransactionSize: builder.getTransactionSize(),
    minimumTransactionsRequired: builder.minimumTransactionsRequired(),
  });

  await builder.sendAndConfirm();

  t.pass();
});
