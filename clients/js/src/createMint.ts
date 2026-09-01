import {
  Context,
  OptionOrNullable,
  PublicKey,
  Signer,
  some,
  transactionBuilder,
  TransactionBuilder,
} from '@metaplex-foundation/umi';
import {
  createAccountWithRent,
  getMintSize,
  initializeMint2,
} from './generated';

// Inputs.
export type CreateMintArgs = {
  mint: Signer;
  decimals?: number;
  mintAuthority?: PublicKey;
  freezeAuthority?: OptionOrNullable<PublicKey>;
};

// Instruction.
export function createMint(
  context: Pick<Context, 'programs' | 'identity' | 'payer'>,
  input: CreateMintArgs
): TransactionBuilder {
  return transactionBuilder()
    .add(
      createAccountWithRent(context, {
        newAccount: input.mint,
        space: getMintSize(),
        programId: context.programs.get('splToken').publicKey,
      })
    )
    .add(
      initializeMint2(context, {
        mint: input.mint.publicKey,
        decimals: input.decimals ?? 0,
        mintAuthority: input.mintAuthority ?? context.identity.publicKey,
        freezeAuthority:
          input.freezeAuthority === undefined
            ? some(context.identity.publicKey)
            : input.freezeAuthority,
      })
    );
}
