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
import { addAccountMeta } from '../shared';

// Accounts.
export type CloseTokenInstructionAccounts = {
  account: PublicKey | Pda;
  destination: PublicKey | Pda;
  owner: Signer;
};

// Data.
export type CloseTokenInstructionData = { discriminator: number };

export type CloseTokenInstructionDataArgs = {};

export function getCloseTokenInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<CloseTokenInstructionDataArgs, CloseTokenInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    CloseTokenInstructionDataArgs,
    any,
    CloseTokenInstructionData
  >(
    s.struct<CloseTokenInstructionData>([['discriminator', s.u8()]], {
      description: 'CloseTokenInstructionData',
    }),
    (value) => ({ ...value, discriminator: 9 })
  ) as Serializer<CloseTokenInstructionDataArgs, CloseTokenInstructionData>;
}

// Instruction.
export function closeToken(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: CloseTokenInstructionAccounts
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
    destination: [input.destination, true] as const,
    owner: [input.owner, false] as const,
  };

  addAccountMeta(keys, signers, resolvedAccounts.account, false);
  addAccountMeta(keys, signers, resolvedAccounts.destination, false);
  addAccountMeta(keys, signers, resolvedAccounts.owner, false);

  // Data.
  const data = getCloseTokenInstructionDataSerializer(context).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
