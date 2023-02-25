import {
  generateSigner,
  PublicKey,
  samePublicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  createAssociatedToken,
  createLutForTransactionBuilder,
  createMint,
  extendLut,
  findAddressLookupTablePda,
  findAssociatedTokenPda,
} from '../src';
import { createUmi } from './_setup';

test('it generates create and close LUT builders for a given transaction builder', async (t) => {
  // Given a recent slot.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  // And a base builder that creates an associated token account.
  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;
  const ata = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner });
  const baseBuilder = transactionBuilder(umi)
    .add(createMint(umi, { mint }))
    .add(createAssociatedToken(umi, { mint: mint.publicKey, owner }));

  // When we create LUT builders for that builder.
  const { lutAccounts, createLutBuilders, builder, closeLutBuilders } =
    createLutForTransactionBuilder(umi, baseBuilder, recentSlot);

  // Then we get an updated version of the base builder that includes an LUT.
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });
  t.is(builder.options.addressLookupTables?.length, 1);
  t.deepEqual(builder.options.addressLookupTables?.[0].publicKey, lut);
  t.deepEqual(builder.options.addressLookupTables?.[0], lutAccounts[0]);

  // And we get builders for creating the LUT depending
  // on the number of addresses to extract.
  t.is(createLutBuilders.length, 1);
  t.true(createLutBuilders[0].fitsInOneTransaction());
  t.is(createLutBuilders[0].getInstructions().length, 2);

  // And we get builders for closing these LUTs if needed.
  t.is(closeLutBuilders.length, 1);
  t.true(closeLutBuilders[0].fitsInOneTransaction());
  t.is(closeLutBuilders[0].getInstructions().length, 1);

  // And we get the public key and addresses of the LUT created.
  const splSystem = umi.programs.get('splSystem').publicKey;
  const mplSystemExtras = umi.programs.get('mplSystemExtras').publicKey;
  const splToken = umi.programs.get('splToken').publicKey;
  const splAssociatedToken = umi.programs.get('splAssociatedToken').publicKey;
  t.is(lutAccounts.length, 1);
  t.deepEqual(lutAccounts[0].publicKey, lut);
  t.is(lutAccounts[0].addresses.length, 6);
  t.true(hasPublicKey(lutAccounts[0].addresses, owner));
  t.true(hasPublicKey(lutAccounts[0].addresses, ata));
  t.true(hasPublicKey(lutAccounts[0].addresses, splSystem));
  t.true(hasPublicKey(lutAccounts[0].addresses, mplSystemExtras));
  t.true(hasPublicKey(lutAccounts[0].addresses, splToken));
  t.true(hasPublicKey(lutAccounts[0].addresses, splAssociatedToken));
  t.false(hasPublicKey(lutAccounts[0].addresses, mint.publicKey));
  t.false(hasPublicKey(lutAccounts[0].addresses, umi.identity.publicKey));
});

test.skip('it generates multiple lut builders such that they each fit under one transaction', async (t) => {
  // Given a recent slot.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  // And a base builder that requires 300 addresses.
  const lut = generateSigner(umi);
  const generatePublicKey = () => generateSigner(umi).publicKey;
  const addressesA = Array.from({ length: 256 }, generatePublicKey);
  const addressesB = Array.from({ length: 44 }, generatePublicKey);
  const baseBuilder = transactionBuilder(umi)
    .add(extendLut(umi, { address: lut.publicKey, addresses: addressesA }))
    .add(extendLut(umi, { address: lut.publicKey, addresses: addressesB }));

  // When we create LUT builders for that builder.
  const { lutAccounts, createLutBuilders, builder, closeLutBuilders } =
    createLutForTransactionBuilder(umi, baseBuilder, recentSlot);

  console.log({ lutAccounts, createLutBuilders, builder, closeLutBuilders });
});

function hasPublicKey(haystack: PublicKey[], needle: PublicKey): boolean {
  return haystack.some((address) => samePublicKey(address, needle));
}

// Test: with more than 256 addresses.
// Test: with making the call to create and close the LUTs.
