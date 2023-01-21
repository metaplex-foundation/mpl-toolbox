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
} from '@lorisleiva/js-core';

// Accounts.
export type InitializeMint2InstructionAccounts = {
  mint: PublicKey;
};

// Arguments.
export type InitializeMint2InstructionData = {
  discriminator: number;
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: Option<PublicKey>;
};

export type InitializeMint2InstructionArgs = {
  decimals: number;
  mintAuthority: PublicKey;
  freezeAuthority: Option<PublicKey>;
};

export function getInitializeMint2InstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<InitializeMint2InstructionArgs, InitializeMint2InstructionData> {
  const s = context.serializer;
  return mapSerializer<
    InitializeMint2InstructionArgs,
    InitializeMint2InstructionData,
    InitializeMint2InstructionData
  >(
    s.struct<InitializeMint2InstructionData>(
      [
        ['discriminator', s.u8],
        ['decimals', s.u8],
        ['mintAuthority', s.publicKey],
        ['freezeAuthority', s.option(s.publicKey)],
      ],
      'InitializeMint2InstructionArgs'
    ),
    (value) =>
      ({ discriminator: 20, ...value } as InitializeMint2InstructionData)
  ) as Serializer<
    InitializeMint2InstructionArgs,
    InitializeMint2InstructionData
  >;
}

// Instruction.
export function initializeMint2(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: InitializeMint2InstructionAccounts & InitializeMint2InstructionArgs
): WrappedInstruction {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId: PublicKey = context.programs.get('splToken').address;

  // Resolved accounts.
  const mintAccount = input.mint;

  // Mint.
  keys.push({
    pubkey: mintAccount,
    isSigner: false,
    isWritable: isWritable(mintAccount, true),
  });

  // Data.
  const data =
    getInitializeMint2InstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return {
    instruction: { keys, programId, data },
    signers,
    bytesCreatedOnChain,
  };
}
