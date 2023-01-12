/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  AccountMeta,
  Context,
  PublicKey,
  Serializer,
  Signer,
  WrappedInstruction,
  getProgramAddressWithFallback,
} from '@lorisleiva/js-core';

// Accounts.
export type ApproveInstructionAccounts = {
  source: PublicKey;
  delegate: PublicKey;
  owner: Signer;
};

// Arguments.
export type ApproveInstructionData = { amount: bigint };

export type ApproveInstructionArgs = { amount: number | bigint };

export function getApproveInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<ApproveInstructionArgs, ApproveInstructionData> {
  const s = context.serializer;
  return s.struct<ApproveInstructionData>(
    [['amount', s.u64]],
    'approveInstructionArgs'
  ) as Serializer<ApproveInstructionArgs, ApproveInstructionData>;
}

// Instruction.
export function approve(
  context: {
    serializer: Context['serializer'];
    eddsa: Context['eddsa'];
    programs?: Context['programs'];
  },
  input: ApproveInstructionAccounts & ApproveInstructionArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = getProgramAddressWithFallback(
    context,
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Source.
  keys.push({ pubkey: input.source, isSigner: false, isWritable: true });

  // Delegate.
  keys.push({ pubkey: input.delegate, isSigner: false, isWritable: false });

  // Owner.
  signers.push(input.owner);
  keys.push({
    pubkey: input.owner.publicKey,
    isSigner: true,
    isWritable: false,
  });

  // Data.
  const data = getApproveInstructionDataSerializer(context).serialize(input);

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain: 0,
  };
}