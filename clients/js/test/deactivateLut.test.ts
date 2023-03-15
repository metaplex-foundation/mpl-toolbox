import {
  generateSigner,
  publicKey,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import test from 'ava';
import {
  AddressLookupTable,
  createLut,
  deactivateLut,
  extendLut,
  fetchAddressLookupTable,
  findAddressLookupTablePda,
} from '../src';
import { createUmi } from './_setup';

test('it can deactivate a LUT', async (t) => {
  // Given an existing LUT with 2 addresses.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const addressA = generateSigner(umi).publicKey;
  const addressB = generateSigner(umi).publicKey;
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });
  await transactionBuilder()
    .add(createLut(umi, { recentSlot }))
    .add(extendLut(umi, { address: lut, addresses: [addressA, addressB] }))
    .sendAndConfirm(umi);

  // When we deactivate the LUT.
  await transactionBuilder()
    .add(deactivateLut(umi, { address: lut }))
    .sendAndConfirm(umi);

  // Then the LUT account has been deactivated.
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  t.not(lutAccount.deactivationSlot, BigInt(`0x${'ff'.repeat(8)}`));
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: some(publicKey(umi.identity)),
    lastExtendedSlot: lutAccount.deactivationSlot - 1n,
  });
});
