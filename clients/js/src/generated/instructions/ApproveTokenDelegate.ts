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
  checkForIsWritableOverride as isWritable,
  mapSerializer,
} from '@lorisleiva/js-core';

// Accounts.
export type ApproveTokenDelegateInstructionAccounts = {
  source: PublicKey;
  delegate: PublicKey;
  owner: Signer;
};

// Arguments.
export type ApproveTokenDelegateInstructionData = {
  discriminator: number;
  amount: bigint;
};

export type ApproveTokenDelegateInstructionArgs = { amount: number | bigint };

export function getApproveTokenDelegateInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  ApproveTokenDelegateInstructionArgs,
  ApproveTokenDelegateInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    ApproveTokenDelegateInstructionArgs,
    ApproveTokenDelegateInstructionData,
    ApproveTokenDelegateInstructionData
  >(
    s.struct<ApproveTokenDelegateInstructionData>(
      [
        ['discriminator', s.u8],
        ['amount', s.u64],
      ],
      'ApproveTokenDelegateInstructionArgs'
    ),
    (value) =>
      ({ discriminator: 4, ...value } as ApproveTokenDelegateInstructionData)
  ) as Serializer<
    ApproveTokenDelegateInstructionArgs,
    ApproveTokenDelegateInstructionData
  >;
}

// Instruction.
export function approveTokenDelegate(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: ApproveTokenDelegateInstructionAccounts &
    ApproveTokenDelegateInstructionArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = context.programs.get('splToken').address;

  // Resolved accounts.
  const sourceAccount = input.source;
  const delegateAccount = input.delegate;
  const ownerAccount = input.owner;

  // Source.
  keys.push({
    pubkey: sourceAccount,
    isSigner: false,
    isWritable: isWritable(sourceAccount, true),
  });

  // Delegate.
  keys.push({
    pubkey: delegateAccount,
    isSigner: false,
    isWritable: isWritable(delegateAccount, false),
  });

  // Owner.
  signers.push(ownerAccount);
  keys.push({
    pubkey: ownerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(ownerAccount, false),
  });

  // Data.
  const data =
    getApproveTokenDelegateInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
