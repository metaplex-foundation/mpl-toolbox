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
  Pda,
  PublicKey,
  Serializer,
  Signer,
  TransactionBuilder,
  mapSerializer,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type BurnTokenCheckedInstructionAccounts = {
  account: PublicKey | Pda;
  mint: PublicKey | Pda;
  authority?: Signer;
};

// Data.
export type BurnTokenCheckedInstructionData = {
  discriminator: number;
  amount: bigint;
  decimals: number;
};

export type BurnTokenCheckedInstructionDataArgs = {
  amount: number | bigint;
  decimals: number;
};

export function getBurnTokenCheckedInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  BurnTokenCheckedInstructionDataArgs,
  BurnTokenCheckedInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    BurnTokenCheckedInstructionDataArgs,
    any,
    BurnTokenCheckedInstructionData
  >(
    s.struct<BurnTokenCheckedInstructionData>(
      [
        ['discriminator', s.u8()],
        ['amount', s.u64()],
        ['decimals', s.u8()],
      ],
      { description: 'BurnTokenCheckedInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 15 })
  ) as Serializer<
    BurnTokenCheckedInstructionDataArgs,
    BurnTokenCheckedInstructionData
  >;
}

// Args.
export type BurnTokenCheckedInstructionArgs =
  BurnTokenCheckedInstructionDataArgs;

// Instruction.
export function burnTokenChecked(
  context: Pick<Context, 'serializer' | 'programs' | 'identity'>,
  input: BurnTokenCheckedInstructionAccounts & BurnTokenCheckedInstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );

  // Resolved inputs.
  const resolvedAccounts = {
    account: [input.account, true] as const,
    mint: [input.mint, true] as const,
  };
  const resolvingArgs = {};
  addObjectProperty(
    resolvedAccounts,
    'authority',
    input.authority
      ? ([input.authority, false] as const)
      : ([context.identity, false] as const)
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.account, false);
  addAccountMeta(keys, signers, resolvedAccounts.mint, false);
  addAccountMeta(keys, signers, resolvedAccounts.authority, false);

  // Data.
  const data =
    getBurnTokenCheckedInstructionDataSerializer(context).serialize(
      resolvedArgs
    );

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
