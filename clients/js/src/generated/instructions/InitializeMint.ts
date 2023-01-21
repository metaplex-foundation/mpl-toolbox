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
  Option,
  PublicKey,
  Serializer,
  Signer,
  WrappedInstruction,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
  publicKey,
} from '@lorisleiva/js-core';

// Accounts.
export type InitializeMintInstructionAccounts = {
  mint: PublicKey;
  rent?: PublicKey;
};

// Arguments.
export type InitializeMintInstructionData = {
  discriminator: number;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: Option<PublicKey>;
};

export type InitializeMintInstructionArgs = {
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: Option<PublicKey>;
};

export function getInitializeMintInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<InitializeMintInstructionArgs, InitializeMintInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    InitializeMintInstructionArgs,
    InitializeMintInstructionData,
    InitializeMintInstructionData
  >(
    s.struct<InitializeMintInstructionData>(
      [
        ['discriminator', s.u8],
        ['decimals', s.u8],
        ['mintAuthority', s.publicKey],
        ['freezeAuthority', s.option(s.publicKey)],
      ],
      'InitializeMintInstructionArgs'
    ),
    (value) => ({ discriminator: 0, ...value } as InitializeMintInstructionData)
  ) as Serializer<InitializeMintInstructionArgs, InitializeMintInstructionData>;
}

// Instruction.
export function initializeMint(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: InitializeMintInstructionAccounts & InitializeMintInstructionArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = context.programs.get('splToken').address;

  // Resolved accounts.
  const mintAccount = input.mint;
  const rentAccount =
    input.rent ?? publicKey('SysvarRent111111111111111111111111111111111');

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, true),
  });

  // Rent.
  keys.push({
    pubkey: rentAccount,
    isSigner: false,
    isWritable: isWritable(rentAccount, false),
  });

  // Data.
  const data =
    getInitializeMintInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
