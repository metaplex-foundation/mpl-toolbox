import {
  Context,
  PublicKey,
  WrappedInstruction,
} from '@metaplex-foundation/umi';
import { createMint, CreateMintArgs } from './createMint';
import { createAssociatedToken, mintTokensTo } from './generated';
import { findAssociatedTokenPda } from './hooked';

// Inputs.
export type CreateMintWithAssociatedTokenArgs = CreateMintArgs & {
  owner: PublicKey;
  amount?: number | bigint;
};

// Instruction.
export function createMintWithAssociatedToken(
  context: Pick<
    Context,
    'serializer' | 'programs' | 'identity' | 'payer' | 'eddsa'
  >,
  input: CreateMintWithAssociatedTokenArgs
): WrappedInstruction[] {
  const mintAndOwner = { mint: input.mint.publicKey, owner: input.owner };
  const amount = input.amount ?? 0;
  const instructions: WrappedInstruction[] = [
    ...createMint(context, input),
    createAssociatedToken(context, mintAndOwner),
  ];

  if (amount > 0) {
    instructions.push(
      mintTokensTo(context, {
        amount,
        mint: input.mint.publicKey,
        token: findAssociatedTokenPda(context, mintAndOwner),
      })
    );
  }

  return instructions;
}
