/* eslint-disable no-promise-executor-return */
import {
  ACCOUNT_HEADER_SIZE,
  AddressLookupTableInput,
  generateSigner,
  publicKey,
  sol,
  some,
  subtractAmounts,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  AddressLookupTable,
  createLut,
  fetchAddressLookupTable,
  transferSol,
} from '../src';
import { createUmi } from './_setup';

test('it can create a LUT with addresses', async (t) => {
  // Given a recent slot and two addresses.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const addressA = generateSigner(umi).publicKey;
  const addressB = generateSigner(umi).publicKey;

  // When we create a LUT with these two addresses.
  const [builder, lut] = createLut(umi, {
    recentSlot,
    addresses: [addressA, addressB],
  });
  await builder.sendAndConfirm(umi);

  // Then we also get the LUT input that can be passed to a transaction builder.
  t.like(lut, <AddressLookupTableInput>{
    publicKey: publicKey(lut),
    addresses: [addressA, addressB],
  });

  // And the LUT account itself has the correct data.
  const lutAccount = await fetchAddressLookupTable(umi, lut.publicKey);
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: some(publicKey(umi.identity)),
    addresses: [addressA, addressB],
  });
});

test('it pays the expected storage fees', async (t) => {
  // Given a recent slot and two addresses.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const addressA = generateSigner(umi).publicKey;
  const addressB = generateSigner(umi).publicKey;

  // And a storage-fee payer with 10 SOL.
  const payer = await generateSignerWithSol(umi, sol(10));

  // When we create a LUT with an explicit payer.
  const [builder] = createLut(umi, {
    recentSlot,
    addresses: [addressA, addressB],
    payer,
  });
  await builder.sendAndConfirm(umi);

  // Then the bytes created on chains are correct.
  const expectedBytes = ACCOUNT_HEADER_SIZE + 56 + 32 * 2;
  t.is(builder.getBytesCreatedOnChain(), expectedBytes);

  // And the rent for these bytes is correct.
  const expectedRent = await umi.rpc.getRent(expectedBytes, {
    includesHeaderBytes: true,
  });
  t.deepEqual(await builder.getRentCreatedOnChain(umi), expectedRent);

  // And the payer paid for exactly that rent.
  const payerAccount = await umi.rpc.getBalance(payer.publicKey);
  t.deepEqual(payerAccount, subtractAmounts(sol(10), expectedRent));
});

test('it can create a LUT and use it on another transaction builder', async (t) => {
  // Given a recent slot
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  // And one source signer with 10 SOL.
  const source = await generateSignerWithSol(umi, sol(10));

  // And 5 destination addresses with 0 SOL.
  const numberOfDestinations = 5;
  const destinations = Array.from({ length: numberOfDestinations }).map(
    () => generateSigner(umi).publicKey
  );

  // And a transaction builder that sends 1 SOL to each destination.
  const destinationBuilders = destinations.map((destination) =>
    transferSol(umi, { source, destination, amount: sol(1) })
  );
  const builderWithoutLut = transactionBuilder().add(destinationBuilders);

  // When we create a LUT for these destination addresses.
  const [lutBuilder, lut] = createLut(umi, {
    recentSlot,
    addresses: destinations,
  });
  await lutBuilder.sendAndConfirm(umi);

  // And use it on the transaction builder that transfers SOL.
  const builderWithLut = builderWithoutLut.setAddressLookupTables([lut]);

  // Then we expect the size of the builder with the LUT to be smaller.
  const transactionSizeDifference =
    builderWithoutLut.getTransactionSize(umi) -
    builderWithLut.getTransactionSize(umi);
  const expectedSizeDifference =
    (32 - 1) * numberOfDestinations + // Replaces public keys with indexes for each destination.
    -32 + // Adds 32 bytes for the LUT address itself.
    -2; // Adds 2 bytes for writable and readonly array sizes.
  t.is(transactionSizeDifference, expectedSizeDifference);

  // And it works when we send the builder with LUT if we wait a bit for the LUT to activate.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await builderWithLut.sendAndConfirm(umi);
  t.deepEqual(
    await umi.rpc.getBalance(source.publicKey),
    sol(numberOfDestinations)
  );
  await Promise.all(
    destinations.map(async (destination) => {
      t.deepEqual(await umi.rpc.getBalance(destination), sol(1));
    })
  );
});
