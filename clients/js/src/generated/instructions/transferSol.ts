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
  Signer,
  SolAmount,
  TransactionBuilder,
  mapAmountSerializer,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  struct,
  u32,
  u64,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type TransferSolInstructionAccounts = {
  source?: Signer;
  destination: PublicKey | Pda;
};

// Data.
export type TransferSolInstructionData = {
  discriminator: number;
  amount: SolAmount;
};

export type TransferSolInstructionDataArgs = { amount: SolAmount };

export function getTransferSolInstructionDataSerializer(): Serializer<
  TransferSolInstructionDataArgs,
  TransferSolInstructionData
> {
  return mapSerializer<
    TransferSolInstructionDataArgs,
    any,
    TransferSolInstructionData
  >(
    struct<TransferSolInstructionData>(
      [
        ['discriminator', u32()],
        ['amount', mapAmountSerializer(u64(), 'SOL', 9)],
      ],
      { description: 'TransferSolInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 2 })
  ) as Serializer<TransferSolInstructionDataArgs, TransferSolInstructionData>;
}

// Args.
export type TransferSolInstructionArgs = TransferSolInstructionDataArgs;

// Instruction.
export function transferSol(
  context: Pick<Context, 'identity' | 'programs'>,
  input: TransferSolInstructionAccounts & TransferSolInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splSystem',
    '11111111111111111111111111111111'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    source: { index: 0, isWritable: true, value: input.source ?? null },
    destination: {
      index: 1,
      isWritable: true,
      value: input.destination ?? null,
    },
  };

  // Arguments.
  const resolvedArgs: TransferSolInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.source.value) {
    resolvedAccounts.source.value = context.identity;
  }

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
  const data = getTransferSolInstructionDataSerializer().serialize(
    resolvedArgs as TransferSolInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
