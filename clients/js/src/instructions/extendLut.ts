import { transactionBuilder } from '@metaplex-foundation/umi';
import {
  ExtendLutInstructionAccounts,
  ExtendLutInstructionData,
  ExtendLutInstructionDataArgs,
  extendLut as baseExtendLut,
} from '../generated/instructions/extendLut';

export {
  ExtendLutInstructionAccounts,
  ExtendLutInstructionData,
  ExtendLutInstructionDataArgs,
};

export function extendLut(
  context: Parameters<typeof baseExtendLut>[0],
  input: Parameters<typeof baseExtendLut>[1]
): ReturnType<typeof baseExtendLut> {
  return transactionBuilder([
    {
      ...baseExtendLut(context, input).items[0],
      bytesCreatedOnChain: 32 * input.addresses.length,
    },
  ]);
}
