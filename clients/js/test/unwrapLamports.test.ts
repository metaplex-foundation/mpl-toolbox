import { generateSigner } from '@metaplex-foundation/umi';
import test from 'ava';
import {
  getUnwrapLamportsInstructionDataSerializer,
  SPL_TOKEN_PROGRAM_ID,
  unwrapLamports,
} from '../src';
import { createOfflineUmi } from './_setup';

test('it builds an unwrap lamports instruction with an amount', (t) => {
  // Given a source account, a destination account and an authority.
  const umi = createOfflineUmi();
  const source = generateSigner(umi).publicKey;
  const destination = generateSigner(umi).publicKey;
  const authority = generateSigner(umi);

  // When we build an unwrap lamports instruction for a given amount.
  const [instruction] = unwrapLamports(umi, {
    source,
    destination,
    authority,
    amount: 42,
  }).getInstructions();

  // Then the instruction targets the SPL Token program with the expected accounts.
  t.is(instruction.programId, SPL_TOKEN_PROGRAM_ID);
  t.deepEqual(instruction.keys, [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: authority.publicKey, isSigner: true, isWritable: false },
  ]);

  // And its data contains the discriminator followed by the optional amount.
  t.deepEqual(
    instruction.data,
    new Uint8Array([45, 1, 42, 0, 0, 0, 0, 0, 0, 0])
  );
});

test('it unwraps all lamports when the amount is null', (t) => {
  // Given a source and a destination account.
  const umi = createOfflineUmi();
  const source = generateSigner(umi).publicKey;
  const destination = generateSigner(umi).publicKey;

  // When we build an unwrap lamports instruction with a null amount.
  const [instruction] = unwrapLamports(umi, {
    source,
    destination,
    amount: null,
  }).getInstructions();

  // Then the identity is used as the authority.
  t.deepEqual(instruction.keys[2], {
    pubkey: umi.identity.publicKey,
    isSigner: true,
    isWritable: false,
  });

  // And the amount is encoded as none.
  t.deepEqual(instruction.data, new Uint8Array([45, 0]));
});

test('it preserves a zero amount instead of unwrapping all lamports', (t) => {
  // Given a source and a destination account.
  const umi = createOfflineUmi();
  const source = generateSigner(umi).publicKey;
  const destination = generateSigner(umi).publicKey;

  // When we build unwrap lamports instructions with a zero amount,
  // as either a number or a bigint.
  const [fromNumber] = unwrapLamports(umi, {
    source,
    destination,
    amount: 0,
  }).getInstructions();
  const [fromBigint] = unwrapLamports(umi, {
    source,
    destination,
    amount: 0n,
  }).getInstructions();

  // Then the amount is encoded as some(0) rather than none.
  const expected = new Uint8Array([45, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  t.deepEqual(fromNumber.data, expected);
  t.deepEqual(fromBigint.data, expected);
});

test('it can deserialize unwrap lamports instruction data', (t) => {
  const serializer = getUnwrapLamportsInstructionDataSerializer();
  const [withAmount] = serializer.deserialize(
    new Uint8Array([45, 1, 42, 0, 0, 0, 0, 0, 0, 0])
  );
  t.deepEqual(withAmount, {
    discriminator: 45,
    amount: { __option: 'Some', value: 42n },
  });
  const [withoutAmount] = serializer.deserialize(new Uint8Array([45, 0]));
  t.deepEqual(withoutAmount, {
    discriminator: 45,
    amount: { __option: 'None' },
  });
});
