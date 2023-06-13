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
import { resolveExtendLutBytes } from '../../hooked';
import { addAccountMeta, addObjectProperty } from '../shared';

// Accounts.
export type ExtendLutInstructionAccounts = {
  address: PublicKey | Pda;
  authority?: Signer;
  payer?: Signer;
  systemProgram?: PublicKey | Pda;
};

// Data.
export type ExtendLutInstructionData = {
  discriminator: number;
  addresses: Array<PublicKey>;
};

export type ExtendLutInstructionDataArgs = { addresses: Array<PublicKey> };

export function getExtendLutInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<ExtendLutInstructionDataArgs, ExtendLutInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    ExtendLutInstructionDataArgs,
    any,
    ExtendLutInstructionData
  >(
    s.struct<ExtendLutInstructionData>(
      [
        ['discriminator', s.u32()],
        ['addresses', s.array(s.publicKey(), { size: s.u64() })],
      ],
      { description: 'ExtendLutInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 2 })
  ) as Serializer<ExtendLutInstructionDataArgs, ExtendLutInstructionData>;
}

// Args.
export type ExtendLutInstructionArgs = ExtendLutInstructionDataArgs;

// Instruction.
export function extendLut(
  context: Pick<
    Context,
    'serializer' | 'programs' | 'eddsa' | 'identity' | 'payer'
  >,
  input: ExtendLutInstructionAccounts & ExtendLutInstructionArgs
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
  const resolvingArgs = {};
  addObjectProperty(
    resolvedAccounts,
    'authority',
    input.authority
      ? ([input.authority, false] as const)
      : ([context.identity, false] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'payer',
    input.payer
      ? ([input.payer, true] as const)
      : ([context.payer, true] as const)
  );
  addObjectProperty(
    resolvedAccounts,
    'systemProgram',
    input.systemProgram
      ? ([input.systemProgram, false] as const)
      : ([
          context.programs.getPublicKey(
            'splSystem',
            '11111111111111111111111111111111'
          ),
          false,
        ] as const)
  );
  const resolvedArgs = { ...input, ...resolvingArgs };

  addAccountMeta(keys, signers, resolvedAccounts.address, false);
  addAccountMeta(keys, signers, resolvedAccounts.authority, false);
  addAccountMeta(keys, signers, resolvedAccounts.payer, false);
  addAccountMeta(keys, signers, resolvedAccounts.systemProgram, false);

  // Data.
  const data =
    getExtendLutInstructionDataSerializer(context).serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = resolveExtendLutBytes(
    context,
    resolvedAccounts,
    resolvedArgs,
    programId
  );

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
