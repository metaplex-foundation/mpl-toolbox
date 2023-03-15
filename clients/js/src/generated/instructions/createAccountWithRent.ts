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
  Serializer,
  Signer,
  TransactionBuilder,
  checkForIsWritableOverride as isWritable,
  mapSerializer,
  transactionBuilder,
} from '@metaplex-foundation/umi';

// Accounts.
export type CreateAccountWithRentInstructionAccounts = {
  /** The account paying for the storage */
  payer?: Signer;
  /** The account being created */
  newAccount: Signer;
  /** System program */
  systemProgram?: PublicKey;
};

// Arguments.
export type CreateAccountWithRentInstructionData = {
  discriminator: number;
  space: bigint;
  programId: PublicKey;
};

export type CreateAccountWithRentInstructionDataArgs = {
  space: number | bigint;
  programId: PublicKey;
};

export function getCreateAccountWithRentInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  CreateAccountWithRentInstructionDataArgs,
  CreateAccountWithRentInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    CreateAccountWithRentInstructionDataArgs,
    CreateAccountWithRentInstructionData,
    CreateAccountWithRentInstructionData
  >(
    s.struct<CreateAccountWithRentInstructionData>(
      [
        ['discriminator', s.u8()],
        ['space', s.u64()],
        ['programId', s.publicKey()],
      ],
      { description: 'CreateAccountWithRentInstructionData' }
    ),
    (value) =>
      ({ ...value, discriminator: 0 } as CreateAccountWithRentInstructionData)
  ) as Serializer<
    CreateAccountWithRentInstructionDataArgs,
    CreateAccountWithRentInstructionData
  >;
}

// Instruction.
export function createAccountWithRent(
  context: Pick<Context, 'serializer' | 'programs' | 'payer'>,
  input: CreateAccountWithRentInstructionAccounts &
    CreateAccountWithRentInstructionDataArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'mplSystemExtras',
    'SysExL2WDyJi9aRZrXorrjHJut3JwHQ7R9bTyctbNNG'
  );

  // Resolved accounts.
  const payerAccount = input.payer ?? context.payer;
  const newAccountAccount = input.newAccount;
  const systemProgramAccount = input.systemProgram ?? {
    ...context.programs.getPublicKey(
      'splSystem',
      '11111111111111111111111111111111'
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

  // New Account.
  signers.push(newAccountAccount);
  keys.push({
    pubkey: newAccountAccount.publicKey,
    isSigner: true,
    isWritable: isWritable(newAccountAccount, true),
  });

  // System Program.
  keys.push({
    pubkey: systemProgramAccount,
    isSigner: false,
    isWritable: isWritable(systemProgramAccount, false),
  });

  // Data.
  const data =
    getCreateAccountWithRentInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = Number(input.space) + ACCOUNT_HEADER_SIZE;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
