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
export type GetTokenDataSizeInstructionAccounts = {
  mint: PublicKey | Pda;
};

// Data.
export type GetTokenDataSizeInstructionData = { discriminator: number };

export type GetTokenDataSizeInstructionDataArgs = {};

export function getGetTokenDataSizeInstructionDataSerializer(): Serializer<
  GetTokenDataSizeInstructionDataArgs,
  GetTokenDataSizeInstructionData
> {
  return mapSerializer<
    GetTokenDataSizeInstructionDataArgs,
    any,
    GetTokenDataSizeInstructionData
  >(
    struct<GetTokenDataSizeInstructionData>([['discriminator', u8()]], {
      description: 'GetTokenDataSizeInstructionData',
    }),
    (value) => ({ ...value, discriminator: 21 })
  ) as Serializer<
    GetTokenDataSizeInstructionDataArgs,
    GetTokenDataSizeInstructionData
  >;
}

// Instruction.
export function getTokenDataSize(
  context: Pick<Context, 'programs'>,
  input: GetTokenDataSizeInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    mint: { index: 0, isWritable: false, value: input.mint ?? null },
  };

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
  const data = getGetTokenDataSizeInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
