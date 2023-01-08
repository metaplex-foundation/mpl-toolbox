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
  PublicKey,
  Serializer,
  Signer,
  WrappedInstruction,
  getProgramAddressWithFallback,
  mapSerializer,
} from '@lorisleiva/js-core';
import {
  CandyMachineData,
  CandyMachineDataArgs,
  getCandyMachineDataSerializer,
} from '../types';

// Accounts.
export type UpdateCandyMachineInstructionAccounts = {
  candyMachine: PublicKey;
  authority: Signer;
};

// Arguments.
export type UpdateCandyMachineInstructionData = {
  discriminator: Array<number>;
  data: CandyMachineData;
};

export type UpdateCandyMachineInstructionArgs = { data: CandyMachineDataArgs };

export function getUpdateCandyMachineInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  UpdateCandyMachineInstructionArgs,
  UpdateCandyMachineInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    UpdateCandyMachineInstructionArgs,
    UpdateCandyMachineInstructionData,
    UpdateCandyMachineInstructionData
  >(
    s.struct<UpdateCandyMachineInstructionData>(
      [
        ['discriminator', s.array(s.u8, 8)],
        ['data', getCandyMachineDataSerializer(context)],
      ],
      'updateInstructionArgs'
    ),
    (value) =>
      ({
        discriminator: [219, 200, 88, 176, 158, 63, 253, 127],
        ...value,
      } as UpdateCandyMachineInstructionData)
  ) as Serializer<
    UpdateCandyMachineInstructionArgs,
    UpdateCandyMachineInstructionData
  >;
}

// Instruction.
export function updateCandyMachine(
  context: {
    serializer: Context['serializer'];
    eddsa: Context['eddsa'];
    programs?: Context['programs'];
  },
  input: UpdateCandyMachineInstructionAccounts &
    UpdateCandyMachineInstructionArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = getProgramAddressWithFallback(
    context,
    'mplCandyMachineCore',
    'CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR'
  );

  // Candy Machine.
  keys.push({ pubkey: input.candyMachine, isSigner: false, isWritable: false });

  // Authority.
  signers.push(input.authority);
  keys.push({
    pubkey: input.authority.publicKey,
    isSigner: true,
    isWritable: false,
  });

  // Data.
  const data =
    getUpdateCandyMachineInstructionDataSerializer(context).serialize(input);

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain: 0,
  };
}