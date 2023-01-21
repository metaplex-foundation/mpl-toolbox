/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  AccountMeta,
  Context,
  PublicKey,
  Serializer,
  Signer,
  WrappedInstruction,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
} from '@lorisleiva/js-core';

// Accounts.
export type ThawTokenInstructionAccounts = {
  account: PublicKey;
  mint: PublicKey;
  owner: Signer;
};

// Arguments.
export type ThawTokenInstructionData = { discriminator: number };

export type ThawTokenInstructionArgs = {};

export function getThawTokenInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<ThawTokenInstructionArgs, ThawTokenInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    ThawTokenInstructionArgs,
    ThawTokenInstructionData,
    ThawTokenInstructionData
  >(
    s.struct<ThawTokenInstructionData>(
      [['discriminator', s.u8]],
      'ThawTokenInstructionArgs'
    ),
    (value) => ({ discriminator: 11, ...value } as ThawTokenInstructionData)
  ) as Serializer<ThawTokenInstructionArgs, ThawTokenInstructionData>;
}

// Instruction.
export function thawToken(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: ThawTokenInstructionAccounts
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = context.programs.get('splToken').address;

  // Resolved accounts.
  const accountAccount = input.account;
  const mintAccount = input.mint;
  const ownerAccount = input.owner;

  // Account.
  keys.push({
    pubkey: accountAccount,
    isSigner: false,
    isWritable: isWritable(accountAccount, true),
  });

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, false),
  });

  // Owner.
  signers.push(ownerAccount);
  keys.push({
    pubkey: ownerAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(ownerAccount, false),
  });

  // Data.
  const data = getThawTokenInstructionDataSerializer(context).serialize({});

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
