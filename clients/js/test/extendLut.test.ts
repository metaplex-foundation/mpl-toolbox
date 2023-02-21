import { subtractAmounts } from '@metaplex-foundation/umi-core';
import {
  generateSigner,
  generateSignerWithSol,
  publicKey,
  sol,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  AddressLookupTable,
  createLut,
  extendLut,
  fetchAddressLookupTable,
  findAddressLookupTablePda,
} from '../src';
import { createUmi } from './_setup';

test('it can add addresses to an empty LUT', async (t) => {
  // Given a recent slot and two addresses.
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });
  const addressA = generateSigner(umi).publicKey;
  const addressB = generateSigner(umi).publicKey;
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });

  // And a payer with 1 SOL only use to extend the LUT.
  const payer = await generateSignerWithSol(umi, sol(1));

  // When we create an empty LUT and add 2 addresses.
  await transactionBuilder(umi)
    .add(createLut(umi, { recentSlot }))
    .add(
      extendLut(
        { ...umi, payer },
        { address: lut, addresses: [addressA, addressB] }
      )
    )
    .sendAndConfirm();

  // Then the LUT has the correct addresses.
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: some(publicKey(umi.identity)),
    addresses: [addressA, addressB],
  });

  // And the payer paid for the storage of these two addresses.
  const payerAccount = await umi.rpc.getBalance(payer.publicKey);
  const rentFor2PublicKeys = await umi.rpc.getRent(32 * 2, {
    includesHeaderBytes: true,
  });
  t.deepEqual(payerAccount, subtractAmounts(sol(1), rentFor2PublicKeys));
});

test('it can add more addresses to an existing LUT', async (t) => {
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

  // And a payer with 1 SOL only use to extend the LUT.
  const payer = await generateSignerWithSol(umi, sol(1));

  // When we add one more address to the LUT.
  const addressC = generateSigner(umi).publicKey;
  await transactionBuilder(umi)
    .add(extendLut({ ...umi, payer }, { address: lut, addresses: [addressC] }))
    .sendAndConfirm();

  // Then the LUT has the correct addresses.
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  t.like(lutAccount, <AddressLookupTable>{
    publicKey: publicKey(lutAccount),
    authority: some(publicKey(umi.identity)),
    addresses: [addressA, addressB, addressC],
  });

  // And the payer only paid for the storage of that one extra address.
  const payerAccount = await umi.rpc.getBalance(payer.publicKey);
  const rentFor1PublicKey = await umi.rpc.getRent(32, {
    includesHeaderBytes: true,
  });
  t.deepEqual(payerAccount, subtractAmounts(sol(1), rentFor1PublicKey));
});
