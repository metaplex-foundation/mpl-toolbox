import { publicKey, WrappedInstruction } from '@metaplex-foundation/umi-core';
import { findAddressLookupTablePda } from '../generated';
import {
  getCreateLutInstructionDataSerializer,
  createLut as baseCreateLut,
  CreateLutInstructionAccounts,
  CreateLutInstructionArgs,
  CreateLutInstructionData,
} from '../generated/instructions/createLut';

export {
  CreateLutInstructionAccounts,
  CreateLutInstructionData,
  CreateLutInstructionArgs,
  getCreateLutInstructionDataSerializer,
};

// Inputs.
export type CreateLutInstructionInput = Omit<
  Parameters<typeof baseCreateLut>[1],
  'bump'
> & { bump?: number };

export const createLut = (
  context: Parameters<typeof baseCreateLut>[0],
  input: CreateLutInstructionInput
): WrappedInstruction => {
  const defaultAddress = findAddressLookupTablePda(context, {
    authority: publicKey(input.authority ?? context.identity),
    recentSlot: input.recentSlot,
  });

  return baseCreateLut(context, {
    ...input,
    bump: input.bump ?? defaultAddress.bump,
  });
};
