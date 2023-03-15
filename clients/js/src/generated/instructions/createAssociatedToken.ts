/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  ACCOUNT_HEADER_SIZE,
  AccountMeta,
  Context,
  PublicKey,
  Signer,
  TransactionBuilder,
  checkForIsWritableOverride as isWritable,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { findAssociatedTokenPda } from '../../hooked';
import { getTokenSize } from '../accounts';

// Accounts.
export type CreateAssociatedTokenInstructionAccounts = {
  payer?: Signer;
  ata?: PublicKey;
  owner?: PublicKey;
  mint: PublicKey;
  systemProgram?: PublicKey;
  tokenProgram?: PublicKey;
};

// Instruction.
export function createAssociatedToken(
  context: Pick<
    Context,
    'serializer' | 'programs' | 'eddsa' | 'identity' | 'payer'
  >,
  input: CreateAssociatedTokenInstructionAccounts
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'splAssociatedToken',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
  );

  // Resolved accounts.
  const payerAccount = input.payer ?? context.payer;
  const ownerAccount = input.owner ?? context.identity.publicKey;
  const mintAccount = input.mint;
  const ataAccount =
    input.ata ??
    findAssociatedTokenPda(context, {
      owner: publicKey(ownerAccount),
      mint: publicKey(mintAccount),
    });
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
    ),
    isWritable: false,
  };
  const tokenProgramAccount = input.tokenProgram ?? {
    ...context.programs.getPublicKey(
      'splToken',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    ),
    isWritable: false,
  };

  // Payer.
  signers.push(payerAccount);
  keys.push({
    pubkey: payerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(payerAccount, true),
  });

  // Ata.
  keys.push({
    pubkey: ataAccount,
    isSigner: false,
    isWritable: isWritable(ataAccount, true),
  });

  // Owner.
  keys.push({
    pubkey: ownerAccount,
    isSigner: false,
    isWritable: isWritable(ownerAccount, false),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, false),
  });

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Token Program.
  keys.push({
    pubkey: tokenProgramAccount,
    isSigner: false,
    isWritable: isWritable(tokenProgramAccount, false),
  });

  // Data.
  const data = new Uint8Array();

  // Bytes Created On Chain.
  const bytesCreatedOnChain = getTokenSize() + ACCOUNT_HEADER_SIZE;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
