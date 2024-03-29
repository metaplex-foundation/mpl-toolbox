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
  publicKey as publicKeySerializer,
  struct,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type InitializeToken2InstructionAccounts = {
  account: PublicKey | Pda;
  mint: PublicKey | Pda;
  rent?: PublicKey | Pda;
};

// Data.
export type InitializeToken2InstructionData = {
  discriminator: number;
  owner: PublicKey;
};

export type InitializeToken2InstructionDataArgs = { owner: PublicKey };

export function getInitializeToken2InstructionDataSerializer(): Serializer<
  InitializeToken2InstructionDataArgs,
  InitializeToken2InstructionData
> {
  return mapSerializer<
    InitializeToken2InstructionDataArgs,
    any,
    InitializeToken2InstructionData
  >(
    struct<InitializeToken2InstructionData>(
      [
        ['discriminator', u8()],
        ['owner', publicKeySerializer()],
      ],
      { description: 'InitializeToken2InstructionData' }
    ),
    (value) => ({ ...value, discriminator: 16 })
  ) as Serializer<
    InitializeToken2InstructionDataArgs,
    InitializeToken2InstructionData
  >;
}

// Args.
export type InitializeToken2InstructionArgs =
  InitializeToken2InstructionDataArgs;

// Instruction.
export function initializeToken2(
  context: Pick<Context, 'programs'>,
  input: InitializeToken2InstructionAccounts & InitializeToken2InstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    account: { index: 0, isWritable: true, value: input.account ?? null },
    mint: { index: 1, isWritable: false, value: input.mint ?? null },
    rent: { index: 2, isWritable: false, value: input.rent ?? null },
  };

  // Arguments.
  const resolvedArgs: InitializeToken2InstructionArgs = { ...input };

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
  const data = getInitializeToken2InstructionDataSerializer().serialize(
    resolvedArgs as InitializeToken2InstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
