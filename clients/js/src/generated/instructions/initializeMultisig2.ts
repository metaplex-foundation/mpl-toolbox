/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Pda,
  PublicKey,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type InitializeMultisig2InstructionAccounts = {
  multisig: PublicKey | Pda;
  signer: PublicKey | Pda;
};

// Data.
export type InitializeMultisig2InstructionData = {
  discriminator: number;
  m: number;
};

export type InitializeMultisig2InstructionDataArgs = { m: number };

export function getInitializeMultisig2InstructionDataSerializer(): Serializer<
  InitializeMultisig2InstructionDataArgs,
  InitializeMultisig2InstructionData
> {
  return mapSerializer<
    InitializeMultisig2InstructionDataArgs,
    any,
    InitializeMultisig2InstructionData
  >(
    struct<InitializeMultisig2InstructionData>(
      [
        ['discriminator', u8()],
        ['m', u8()],
      ],
      { description: 'InitializeMultisig2InstructionData' }
    ),
    (value) => ({ ...value, discriminator: 19 })
  ) as Serializer<
    InitializeMultisig2InstructionDataArgs,
    InitializeMultisig2InstructionData
  >;
}

// Args.
export type InitializeMultisig2InstructionArgs =
  InitializeMultisig2InstructionDataArgs;

// Instruction.
export function initializeMultisig2(
  context: Pick<Context, 'programs'>,
  input: InitializeMultisig2InstructionAccounts &
    InitializeMultisig2InstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    multisig: { index: 0, isWritable: true, value: input.multisig ?? null },
    signer: { index: 1, isWritable: false, value: input.signer ?? null },
  };

  // Arguments.
  const resolvedArgs: InitializeMultisig2InstructionArgs = { ...input };

  // Accounts in order.
  const orderedAccounts: ResolvedAccount[] = Object.values(
    resolvedAccounts
  ).sort((a, b) => a.index - b.index);

  // Keys and Signers.
  const [keys, signers] = getAccountMetasAndSigners(
    orderedAccounts,
    'programId',
    programId
  );

  // Data.
  const data = getInitializeMultisig2InstructionDataSerializer().serialize(
    resolvedArgs as InitializeMultisig2InstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
