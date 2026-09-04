import { generateSigner } from '@metaplex-foundation/umi';
import test from 'ava';
import { SPL_TOKEN_PROGRAM_ID, withdrawExcessLamports } from '../src';
import { createOfflineUmi } from './_setup';

test('it builds a withdraw excess lamports instruction', (t) => {
  // Given a source account, a destination account and an authority.
  const umi = createOfflineUmi();
  const source = generateSigner(umi).publicKey;
  const destination = generateSigner(umi).publicKey;
  const authority = generateSigner(umi);

  // When we build a withdraw excess lamports instruction.
  const [instruction] = withdrawExcessLamports(umi, {
    source,
    destination,
    authority,
  }).getInstructions();

  // Then the instruction targets the SPL Token program with the expected accounts.
  t.is(instruction.programId, SPL_TOKEN_PROGRAM_ID);
  t.deepEqual(instruction.keys, [
    { pubkey: source, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: authority.publicKey, isSigner: true, isWritable: false },
  ]);

  // And its data only contains the instruction discriminator.
  t.deepEqual(instruction.data, new Uint8Array([38]));
});

test('it defaults the authority to the identity', (t) => {
  // Given a source and a destination account.
  const umi = createOfflineUmi();
  const source = generateSigner(umi).publicKey;
  const destination = generateSigner(umi).publicKey;

  // When we build the instruction without an explicit authority.
  const [instruction] = withdrawExcessLamports(umi, {
    source,
    destination,
  }).getInstructions();

  // Then the identity is used as the authority.
  t.deepEqual(instruction.keys[2], {
    pubkey: umi.identity.publicKey,
    isSigner: true,
    isWritable: false,
  });
});
