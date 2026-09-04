import test from 'ava';
import { getBatchTokenInstructionsInstructionDataSerializer } from '../src';

// A transfer of 42 tokens (discriminator 3 followed by a u64 amount)
// and a close account instruction (discriminator 9).
const transferData = new Uint8Array([3, 42, 0, 0, 0, 0, 0, 0, 0]);
const closeData = new Uint8Array([9]);

test('it serializes a batch of token instructions', (t) => {
  // Given a batch of two token instructions.
  const serializer = getBatchTokenInstructionsInstructionDataSerializer();

  // When we serialize them.
  const bytes = serializer.serialize({
    instructions: [
      { numberOfAccounts: 3, instructionData: transferData },
      { numberOfAccounts: 3, instructionData: closeData },
    ],
  });

  // Then the data contains the batch discriminator followed by, for each
  // batched instruction, the number of accounts and the u8-length-prefixed
  // instruction data, with no array length prefix.
  t.deepEqual(
    bytes,
    new Uint8Array([
      255, // Batch discriminator.
      3, // Number of accounts of the transfer instruction.
      9, // Length of the transfer instruction data.
      ...transferData,
      3, // Number of accounts of the close instruction.
      1, // Length of the close instruction data.
      ...closeData,
    ])
  );
});

test('it serializes an empty batch', (t) => {
  const serializer = getBatchTokenInstructionsInstructionDataSerializer();
  t.deepEqual(
    serializer.serialize({ instructions: [] }),
    new Uint8Array([255])
  );
});

test('it deserializes a batch of token instructions', (t) => {
  // Given serialized batch instruction data.
  const serializer = getBatchTokenInstructionsInstructionDataSerializer();
  const bytes = new Uint8Array([
    255,
    3,
    9,
    ...transferData,
    3,
    1,
    ...closeData,
  ]);

  // When we deserialize it.
  const [data, offset] = serializer.deserialize(bytes);

  // Then we get the batched instructions back and the whole buffer is consumed.
  t.deepEqual(data, {
    discriminator: 255,
    instructions: [
      { numberOfAccounts: 3, instructionData: transferData },
      { numberOfAccounts: 3, instructionData: closeData },
    ],
  });
  t.is(offset, bytes.length);
});

test('it deserializes a batch from an offset', (t) => {
  // Given a buffer with leading bytes before the batch instruction data.
  const serializer = getBatchTokenInstructionsInstructionDataSerializer();
  const bytes = new Uint8Array([7, 7, 255, 3, 1, ...closeData]);

  // When we deserialize from the batch offset.
  const [data, offset] = serializer.deserialize(bytes, 2);

  // Then the leading bytes are ignored.
  t.deepEqual(data, {
    discriminator: 255,
    instructions: [{ numberOfAccounts: 3, instructionData: closeData }],
  });
  t.is(offset, bytes.length);
});
