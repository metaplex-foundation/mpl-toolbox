import {
  Context,
  PublicKey,
  Signer,
  transactionBuilder,
  TransactionBuilder,
} from '@metaplex-foundation/umi';
import {
  createAccountWithRent,
  getTokenSize,
  initializeToken3,
} from './generated';

// Inputs.
export type CreateTokenArgs = {
  token: Signer;
  mint: PublicKey;
  owner?: PublicKey;
  /** The token program to use. Defaults to the SPL Token program. */
  tokenProgram?: PublicKey;
};

// Instruction.
export function createToken(
  context: Pick<Context, 'programs' | 'identity' | 'payer'>,
  input: CreateTokenArgs
): TransactionBuilder {
  const tokenProgram =
    input.tokenProgram ?? context.programs.get('splToken').publicKey;
  return transactionBuilder()
    .add(
      createAccountWithRent(context, {
        newAccount: input.token,
        space: getTokenSize(),
        programId: tokenProgram,
      })
    )
    .add(
      initializeToken3(context, {
        account: input.token.publicKey,
        mint: input.mint,
        owner: input.owner ?? context.identity.publicKey,
        tokenProgram,
      })
    );
}
