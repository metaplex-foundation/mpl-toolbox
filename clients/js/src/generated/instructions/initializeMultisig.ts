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
  publicKey,
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
export type InitializeMultisigInstructionAccounts = {
  multisig: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type InitializeMultisigInstructionData = {
  discriminator: number;
  m: number;
};

export type InitializeMultisigInstructionDataArgs = { m: number };

export function getInitializeMultisigInstructionDataSerializer(): Serializer<
  InitializeMultisigInstructionDataArgs,
  InitializeMultisigInstructionData
> {
  return mapSerializer<
    InitializeMultisigInstructionDataArgs,
    any,
    InitializeMultisigInstructionData
  >(
    struct<InitializeMultisigInstructionData>(
      [
        ['discriminator', u8()],
        ['m', u8()],
      ],
      { description: 'InitializeMultisigInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 2 })
  ) as Serializer<
    InitializeMultisigInstructionDataArgs,
    InitializeMultisigInstructionData
  >;
}

// Args.
export type InitializeMultisigInstructionArgs =
  InitializeMultisigInstructionDataArgs;

// Instruction.
export function initializeMultisig(
  context: Pick<Context, 'programs'>,
  input: InitializeMultisigInstructionAccounts &
    InitializeMultisigInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    multisig: { index: 0, isWritable: true, value: input.multisig ?? null },
    rent: { index: 1, isWritable: false, value: input.rent ?? null },
  };

  // Arguments.
  const resolvedArgs: InitializeMultisigInstructionArgs = { ...input };

  // Default values.
  if (!resolvedAccounts.rent.value) {
    resolvedAccounts.rent.value = publicKey(
      'SysvarRent111111111111111111111111111111111'
    );
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
  const data = getInitializeMultisigInstructionDataSerializer().serialize(
    resolvedArgs as InitializeMultisigInstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
