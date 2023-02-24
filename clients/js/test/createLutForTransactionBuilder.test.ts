import {
  generateSigner,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import { createLut, extendLut, findAddressLookupTablePda } from '../src';
import { createUmi } from './_setup';

test('it can create a new empty LUT with minimum configuration', async (t) => {
  // Given a recent slot.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });

  const addresses = Array(31)
    .fill(0)
    .map(() => generateSigner(umi).publicKey);

  // When we create a new LUT using that slot.
  const builder = transactionBuilder(umi)
    .add(createLut(umi, { recentSlot }))
    .add(extendLut(umi, { address: lut, addresses }));

  console.log(builder.getTransactionSize());
  await builder.sendAndConfirm();

  t.pass();
});
