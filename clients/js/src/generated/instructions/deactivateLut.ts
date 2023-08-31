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
  u32,
} from '@metaplex-foundation/umi/serializers';
import {
  ResolvedAccount,
  ResolvedAccountsWithIndices,
  getAccountMetasAndSigners,
} from '../shared';

// Accounts.
export type DeactivateLutInstructionAccounts = {
  address: PublicKey | Pda;
  authority?: Signer;
};

// Data.
export type DeactivateLutInstructionData = { discriminator: number };

export type DeactivateLutInstructionDataArgs = {};

export function getDeactivateLutInstructionDataSerializer(): Serializer<
  DeactivateLutInstructionDataArgs,
  DeactivateLutInstructionData
> {
  return mapSerializer<
    DeactivateLutInstructionDataArgs,
    any,
    DeactivateLutInstructionData
  >(
    struct<DeactivateLutInstructionData>([['discriminator', u32()]], {
      description: 'DeactivateLutInstructionData',
    }),
    (value) => ({ ...value, discriminator: 3 })
  ) as Serializer<
    DeactivateLutInstructionDataArgs,
    DeactivateLutInstructionData
  >;
}

// Instruction.
export function deactivateLut(
  context: Pick<Context, 'identity' | 'programs'>,
  input: DeactivateLutInstructionAccounts
): TransactionBuilder {
  // Program ID.
  const programId = context.programs.getPublicKey(
    'splAddressLookupTable',
    'AddressLookupTab1e1111111111111111111111111'
  );

  // Accounts.
  const resolvedAccounts: ResolvedAccountsWithIndices = {
    address: { index: 0, isWritable: true, value: input.address ?? null },
    authority: { index: 1, isWritable: false, value: input.authority ?? null },
  };

  // Default values.
  if (!resolvedAccounts.authority.value) {
    resolvedAccounts.authority.value = context.identity;
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
  const data = getDeactivateLutInstructionDataSerializer().serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
