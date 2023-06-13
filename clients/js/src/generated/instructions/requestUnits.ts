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
  Serializer,
  Signer,
  TransactionBuilder,
  mapSerializer,
  transactionBuilder,
} from '@metaplex-foundation/umi';

// Data.
export type RequestUnitsInstructionData = {
  discriminator: number;
  /** Units to request for transaction-wide compute. */
  units: number;
  /** Prioritization fee lamports. */
  additionalFee: number;
};

export type RequestUnitsInstructionDataArgs = {
  /** Units to request for transaction-wide compute. */
  units: number;
  /** Prioritization fee lamports. */
  additionalFee: number;
};

export function getRequestUnitsInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<RequestUnitsInstructionDataArgs, RequestUnitsInstructionData> {
  const s = context.serializer;
  return mapSerializer<
    RequestUnitsInstructionDataArgs,
    any,
    RequestUnitsInstructionData
  >(
    s.struct<RequestUnitsInstructionData>(
      [
        ['discriminator', s.u8()],
        ['units', s.u32()],
        ['additionalFee', s.u32()],
      ],
      { description: 'RequestUnitsInstructionData' }
    ),
    (value) => ({ ...value, discriminator: 0 })
  ) as Serializer<RequestUnitsInstructionDataArgs, RequestUnitsInstructionData>;
}

// Args.
export type RequestUnitsInstructionArgs = RequestUnitsInstructionDataArgs;

// Instruction.
export function requestUnits(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: RequestUnitsInstructionArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'splComputeBudget',
    'ComputeBudget111111111111111111111111111111'
  );

  // Resolved inputs.
  const resolvingArgs = {};
  const resolvedArgs = { ...input, ...resolvingArgs };

  // Data.
  const data =
    getRequestUnitsInstructionDataSerializer(context).serialize(resolvedArgs);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}
