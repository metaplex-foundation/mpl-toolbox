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
export type DeactivateLutInstructionAccounts = {
  address: PublicKey | Pda;
  authority?: Signer;
};

// Data.
export type DeactivateLutInstructionData = { discriminator: number };

export type DeactivateLutInstructionDataArgs = {};

export function getDeactivateLutInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<DeactivateLutInstructionDataArgs, DeactivateLutInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    DeactivateLutInstructionDataArgs,
    any,
    DeactivateLutInstructionData
  >(
    s.struct<DeactivateLutInstructionData>([['discriminator', s.u32()]], {
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
  context: Pick<Context, 'serializer' | 'programs' | 'identity'>,
  input: DeactivateLutInstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'splAddressLookupTable',
    'AddressLookupTab1e1111111111111111111111111'
  );

  // Resolved inputs.
  const resolvedAccounts = {
    address: [input.address, true] as const,
  };
  addObjectProperty(
    resolvedAccounts,
    'authority',
    input.authority
      ? ([input.authority, false] as const)
      : ([context.identity, false] as const)
  );

  addAccountMeta(keys, signers, resolvedAccounts.address, false);
  addAccountMeta(keys, signers, resolvedAccounts.authority, false);

  // Data.
  const data = getDeactivateLutInstructionDataSerializer(context).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
