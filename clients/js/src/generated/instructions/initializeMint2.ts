/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Context,
  Option,
  OptionOrNullable,
  Pda,
  PublicKey,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  Serializer,
  mapSerializer,
  option,
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
export type InitializeMint2InstructionAccounts = {
  mint: PublicKey | Pda;
};

// Data.
export type InitializeMint2InstructionData = {
  discriminator: number;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: Option<PublicKey>;
};

export type InitializeMint2InstructionDataArgs = {
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: OptionOrNullable<PublicKey>;
};

export function getInitializeMint2InstructionDataSerializer(): Serializer<
  InitializeMint2InstructionDataArgs,
  InitializeMint2InstructionData
> {
  return mapSerializer<
    InitializeMint2InstructionDataArgs,
    any,
    InitializeMint2InstructionData
  >(
    struct<InitializeMint2InstructionData>(
      [
        ['discriminator', u8()],
        ['decimals', u8()],
        ['mintAuthority', publicKeySerializer()],
        ['freezeAuthority', option(publicKeySerializer())],
      ],
      { description: 'InitializeMint2InstructionData' }
    ),
    (value) => ({ ...value, discriminator: 20 })
  ) as Serializer<
    InitializeMint2InstructionDataArgs,
    InitializeMint2InstructionData
  >;
}

// Args.
export type InitializeMint2InstructionArgs = InitializeMint2InstructionDataArgs;

// Instruction.
export function initializeMint2(
  context: Pick<Context, 'programs'>,
  input: InitializeMint2InstructionAccounts & InitializeMint2InstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    mint: { index: 0, isWritable: true, value: input.mint ?? null },
  };

  // Arguments.
  const resolvedArgs: InitializeMint2InstructionArgs = { ...input };

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
  const data = getInitializeMint2InstructionDataSerializer().serialize(
    resolvedArgs as InitializeMint2InstructionDataArgs
  );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
