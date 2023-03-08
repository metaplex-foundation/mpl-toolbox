import {
  Context,
  PublicKey,
  WrappedInstruction,
} from '@metaplex-foundation/umi';
import { createMint, CreateMintArgs } from './createMint';
import { createAssociatedToken, mintTokensTo } from './generated';
import { findAssociatedTokenPda } from './hooked';

// Inputs.
export type CreateMintWithSingleTokenArgs = CreateMintArgs & {
  owner: PublicKey;
};

// Instruction.
export function createMintWithSingleToken(
  context: Pick<
    Context,
    'serializer' | 'programs' | 'identity' | 'payer' | 'eddsa'
  >,
  input: CreateMintWithSingleTokenArgs
): WrappedInstruction[] {
  const mintAndOwner = { mint: input.mint.publicKey, owner: input.owner };
  return [
    ...createMint(context, input),
    createAssociatedToken(context, mintAndOwner),
    mintTokensTo(context, {
      amount: 1,
      mint: input.mint.publicKey,
      token: findAssociatedTokenPda(context, mintAndOwner),
    }),
  ];
}
