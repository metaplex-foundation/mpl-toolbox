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
  u64,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type ApproveTokenDelegateCheckedInstructionAccounts = {
  source: PublicKey | Pda;
  mint: PublicKey | Pda;
  delegate: PublicKey | Pda;
  owner: Signer;
};

// Data.
export type ApproveTokenDelegateCheckedInstructionData = {
  discriminator: number;
  amount: bigint;
  decimals: number;
};

export type ApproveTokenDelegateCheckedInstructionDataArgs = {
  amount: number | bigint;
  decimals: number;
};

export function getApproveTokenDelegateCheckedInstructionDataSerializer(): Serializer<
  ApproveTokenDelegateCheckedInstructionDataArgs,
  ApproveTokenDelegateCheckedInstructionData
> {
  return mapSerializer<
    ApproveTokenDelegateCheckedInstructionDataArgs,
    any,
    ApproveTokenDelegateCheckedInstructionData
  >(
    struct<ApproveTokenDelegateCheckedInstructionData>(
      [
        ['discriminator', u8()],
        ['amount', u64()],
        ['decimals', u8()],
      ],
      { description: 'ApproveTokenDelegateCheckedInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 13 })
  ) as Serializer<
    ApproveTokenDelegateCheckedInstructionDataArgs,
    ApproveTokenDelegateCheckedInstructionData
  >;
}

// Args.
export type ApproveTokenDelegateCheckedInstructionArgs =
  ApproveTokenDelegateCheckedInstructionDataArgs;

// Instruction.
export function approveTokenDelegateChecked(
  context: Pick<Context, 'programs'>,
  input: ApproveTokenDelegateCheckedInstructionAccounts &
    ApproveTokenDelegateCheckedInstructionArgs
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    source: { index: 0, isWritable: true, value: input.source ?? null },
    mint: { index: 1, isWritable: false, value: input.mint ?? null },
    delegate: { index: 2, isWritable: false, value: input.delegate ?? null },
    owner: { index: 3, isWritable: false, value: input.owner ?? null },
  };

  // Arguments.
  const resolvedArgs: ApproveTokenDelegateCheckedInstructionArgs = { ...input };

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
  const data =
    getApproveTokenDelegateCheckedInstructionDataSerializer().serialize(
      resolvedArgs as ApproveTokenDelegateCheckedInstructionDataArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
