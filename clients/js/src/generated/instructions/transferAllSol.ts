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
export type TransferAllSolInstructionAccounts = {
  /** The source account sending all its lamports */
  source?: Signer;
  /** The destination account receiving the lamports */
  destination: PublicKey | Pda;
  /** System program */
  systemProgram?: PublicKey | Pda;
};

// Data.
export type TransferAllSolInstructionData = { discriminator: number };

export type TransferAllSolInstructionDataArgs = {};

export function getTransferAllSolInstructionDataSerializer(): Serializer<
  TransferAllSolInstructionDataArgs,
  TransferAllSolInstructionData
> {
  return mapSerializer<
    TransferAllSolInstructionDataArgs,
    any,
    TransferAllSolInstructionData
  >(
    struct<TransferAllSolInstructionData>([['discriminator', u8()]], {
      description: 'TransferAllSolInstructionData',
    }),
    (value) => ({ ...value, discriminator: 1 })
  ) as Serializer<
    TransferAllSolInstructionDataArgs,
    TransferAllSolInstructionData
  >;
}

// Instruction.
export function transferAllSol(
  context: Pick<Context, 'identity' | 'programs'>,
  input: TransferAllSolInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplSystemExtras',
    'SysExL2WDyJi9aRZrXorrjHJut3JwHQ7R9bTyctbNNG'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    source: { index: 0, isWritable: true, value: input.source ?? null },
    destination: {
      index: 1,
      isWritable: true,
      value: input.destination ?? null,
    },
    systemProgram: {
      index: 2,
      isWritable: false,
      value: input.systemProgram ?? null,
    },
  };

  // Default values.
  if (!resolvedAccounts.source.value) {
    resolvedAccounts.source.value = context.identity;
  }
  if (!resolvedAccounts.systemProgram.value) {
    resolvedAccounts.systemProgram.value = context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    );
    resolvedAccounts.systemProgram.isWritable = false;
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
  const data = getTransferAllSolInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
