import {
  Context,
  PublicKey,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { createMint, CreateMintArgs } from './createMint';
import { createAssociatedToken, mintTokensTo } from './generated';
import { findAssociatedTokenPda } from './hooked';

// Inputs.
export type CreateMintWithAssociatedTokenArgs = CreateMintArgs & {
  owner?: PublicKey;
  amount?: number | bigint;
};

// Instruction.
export function createMintWithAssociatedToken(
  context: Pick<
    Context,
    'serializer' | 'programs' | 'identity' | 'payer' | 'eddsa'
  >,
  input: CreateMintWithAssociatedTokenArgs
): TransactionBuilder {
  const mintAndOwner = {
    mint: input.mint.publicKey,
    owner: input.owner ?? context.identity.publicKey,
  };
  const amount = input.amount ?? 0;
  let builder = transactionBuilder()
    .add(createMint(context, input))
    .add(createAssociatedToken(context, mintAndOwner));

  if (amount > 0) {
    builder = builder.add(
      mintTokensTo(context, {
        amount,
        mint: input.mint.publicKey,
        token: findAssociatedTokenPda(context, mintAndOwner),
      })
    );
  }

  return builder;
}
