import {
  generateSigner,
  none,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  AddressLookupTable,
  createLut,
  extendLut,
  fetchAddressLookupTable,
  findAddressLookupTablePda,
  freezeLut,
} from '../src';
import { createUmi } from './_setup';

test('it can freeze a LUT', async (t) => {
  // Given an existing LUT with 2 addresses.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const addressA = generateSigner(umi).publicKey;
  const addressB = generateSigner(umi).publicKey;
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });
  await transactionBuilder(umi)
    .add(createLut(umi, { recentSlot }))
    .add(extendLut(umi, { address: lut, addresses: [addressA, addressB] }))
    .sendAndConfirm();

  // When we freeze the LUT.
  await transactionBuilder(umi)
    .add(freezeLut(umi, { address: lut }))
    .sendAndConfirm();

  // Then the LUT account no longer has an authority.
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: none(),
  });
});
