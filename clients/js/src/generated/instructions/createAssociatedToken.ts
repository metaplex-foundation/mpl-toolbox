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
  WrappedInstruction,
  checkForIsWritableOverride as isWritable,
  publicKey,
} from '@metaplex-foundation/umi-core';
import { findAssociatedTokenPda } from 'rootHooked';
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
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey =
    context.programs.get('splAssociatedToken').publicKey;

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
    ...context.programs.get('splSystem').publicKey,
    isWritable: false,
  };
  const tokenProgramAccount = input.tokenProgram ?? {
    ...context.programs.get('splToken').publicKey,
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
  const bytesCreatedOnChain =
    (getTokenSize(context) ?? 0) + ACCOUNT_HEADER_SIZE;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
