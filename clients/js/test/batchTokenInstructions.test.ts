import { generateSigner } from '@metaplex-foundation/umi';
import test from 'ava';
import {
  batchTokenInstructions,
  closeToken,
  getBatchTokenInstructionsInstructionDataSerializer,
  SPL_TOKEN_PROGRAM_ID,
  transferTokens,
} from '../src';
import { createOfflineUmi } from './_setup';

test('it builds a batch of token instructions', (t) => {
  // Given a transfer instruction and a close instruction.
  const umi = createOfflineUmi();
  const source = generateSigner(umi).publicKey;
  const destination = generateSigner(umi).publicKey;
  const owner = generateSigner(umi);
  const [transfer] = transferTokens(umi, {
    source,
    destination,
    authority: owner,
    amount: 42,
  }).getInstructions();
  const [close] = closeToken(umi, {
    account: source,
    destination: owner.publicKey,
    owner,
  }).getInstructions();

  // When we batch them into a single instruction, passing the accounts
  // of each batched instruction in sequence as remaining accounts.
  const [instruction] = batchTokenInstructions(umi, {
    instructions: [transfer, close].map((ix) => ({
      numberOfAccounts: ix.keys.length,
      instructionData: ix.data,
    })),
  })
    .addRemainingAccounts([...transfer.keys, ...close.keys])
    .getInstructions();

  // Then the instruction targets the SPL Token program
  // with the accounts of all batched instructions.
  t.is(instruction.programId, SPL_TOKEN_PROGRAM_ID);
  t.deepEqual(instruction.keys, [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: owner.publicKey, isSigner: true, isWritable: false },
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: owner.publicKey, isSigner: false, isWritable: true },
    { pubkey: owner.publicKey, isSigner: true, isWritable: false },
  ]);

  // And its data contains, for each batched instruction, the number of
  // accounts followed by the length-prefixed instruction data.
  t.deepEqual(
    instruction.data,
    new Uint8Array([
      255, // Batch discriminator.
      3, // Number of accounts of the transfer instruction.
      9, // Length of the transfer instruction data.
      3, // Transfer discriminator.
      42,
      0,
      0,
      0,
      0,
      0,
      0,
      0, // Transfer amount.
      3, // Number of accounts of the close instruction.
      1, // Length of the close instruction data.
      9, // Close discriminator.
    ])
  );
});

test('it can deserialize batch instruction data', (t) => {
  const serializer = getBatchTokenInstructionsInstructionDataSerializer();
  const [data] = serializer.deserialize(
    new Uint8Array([255, 3, 9, 3, 42, 0, 0, 0, 0, 0, 0, 0, 3, 1, 9])
  );
  t.deepEqual(data, {
    discriminator: 255,
    instructions: [
      {
        numberOfAccounts: 3,
        instructionData: new Uint8Array([3, 42, 0, 0, 0, 0, 0, 0, 0]),
      },
      { numberOfAccounts: 3, instructionData: new Uint8Array([9]) },
    ],
  });
});
