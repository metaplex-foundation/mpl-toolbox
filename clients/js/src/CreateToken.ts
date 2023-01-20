import {
  Context,
  getProgramAddressWithFallback,
  PublicKey,
  Signer,
  WrappedInstruction,
} from '@lorisleiva/js-core';
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
};

// Instruction.
export function createToken(
  context: {
    serializer: Context['serializer'];
    eddsa: Context['eddsa'];
    identity: Context['identity'];
    payer: Context['payer'];
    programs?: Context['programs'];
  },
  input: CreateTokenArgs
): WrappedInstruction[] {
  return [
    createAccountWithRent(context, {
      newAccount: input.token,
      space: getTokenSize(),
      programId: getProgramAddressWithFallback(
        context,
        'splToken',
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      ),
    }),
    initializeToken3(context, {
      account: input.token.publicKey,
      mint: input.mint,
      owner: input.owner ?? context.identity.publicKey,
    }),
  ];
}
