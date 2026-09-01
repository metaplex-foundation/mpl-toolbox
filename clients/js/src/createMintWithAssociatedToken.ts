import {
  Context,
  PublicKey,
  Signer,
  TransactionBuilder,
  isSigner,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { createMint, CreateMintArgs } from './createMint';
import { createAssociatedToken, mintTokensTo } from './generated';
import { findAssociatedTokenPda } from './hooked';

// Inputs.
export type CreateMintWithAssociatedTokenArgs = Omit<
  CreateMintArgs,
  'mintAuthority'
> & {
  owner?: PublicKey;
  amount?: number | bigint;
  mintAuthority?: PublicKey | Signer;
};

// Instruction.
export function createMintWithAssociatedToken(
  context: Pick<Context, 'programs' | 'identity' | 'payer' | 'eddsa'>,
  input: CreateMintWithAssociatedTokenArgs
): TransactionBuilder {
  const mintAndOwner = {
    mint: input.mint.publicKey,
    owner: input.owner ?? context.identity.publicKey,
  };
  const amount = input.amount ?? 0;
  let builder = transactionBuilder()
    .add(
      createMint(context, {
        ...input,
        mintAuthority: input.mintAuthority
          ? publicKey(input.mintAuthority, false)
          : undefined,
      })
    )
    .add(createAssociatedToken(context, mintAndOwner));

  if (amount > 0) {
    builder = builder.add(
      mintTokensTo(context, {
        amount,
        mint: input.mint.publicKey,
        token: findAssociatedTokenPda(context, mintAndOwner),
        mintAuthority:
          input.mintAuthority && isSigner(input.mintAuthority)
            ? input.mintAuthority
            : undefined,
      })
    );
  }

  return builder;
}
