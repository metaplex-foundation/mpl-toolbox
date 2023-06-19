import {
  AddressLookupTableInput,
  Context,
  PublicKey,
  transactionBuilder,
  TransactionBuilder,
} from '@metaplex-foundation/umi';
import {
  createEmptyLut,
  extendLut,
  findAddressLookupTablePda,
} from './generated';

// Inputs.
export type CreateLutArgs = Parameters<typeof createEmptyLut>[1] & {
  addresses: PublicKey[];
};

// Instruction.
export function createLut(
  context: Pick<Context, 'eddsa' | 'programs' | 'identity' | 'payer'>,
  input: CreateLutArgs
): [TransactionBuilder, AddressLookupTableInput] {
  const { addresses, ...rest } = input;
  const authority = input.authority ?? context.identity;
  const address =
    input.address ??
    findAddressLookupTablePda(context, {
      authority: authority.publicKey,
      recentSlot: input.recentSlot,
    });
  const builder = transactionBuilder()
    .add(createEmptyLut(context, rest))
    .add(
      extendLut(context, {
        address,
        authority,
        addresses,
        payer: input.payer,
      })
    );

  return [builder, { publicKey: address[0], addresses }];
}
