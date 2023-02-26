import {
  generateSigner,
  PublicKey,
  publicKey,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  AddressLookupTable,
  createLut,
  fetchAddressLookupTable,
  findAddressLookupTablePda,
} from '../src';
import { createUmi } from './_setup';

test('it can create a new empty LUT with minimum configuration', async (t) => {
  // Given a recent slot.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  // When we create a new LUT using that slot.
  await transactionBuilder(umi)
    .add(createLut(umi, { recentSlot }))
    .sendAndConfirm();

  // Then a new account was created with the correct data.
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: some(publicKey(umi.identity)),
    addresses: [] as PublicKey[],
    deactivationSlot: BigInt(`0x${'ff'.repeat(8)}`),
    lastExtendedSlot: 0n,
    lastExtendedStartIndex: 0,
  });
});

test('it can create a new empty LUT with a custom authority', async (t) => {
  // Given a custom authority.
  const umi = await createUmi();
  const authority = generateSigner(umi);
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  // When we create a new LUT from that authority.
  await transactionBuilder(umi)
    .add(createLut(umi, { recentSlot, authority }))
    .sendAndConfirm();

  // Then the created LUT has the correct authority.
  const lut = findAddressLookupTablePda(umi, {
    authority: authority.publicKey,
    recentSlot,
  });
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: some(publicKey(authority)),
  });
});
