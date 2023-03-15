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
  SolAmount,
  TransactionBuilder,
  mapAmountSerializer,
  mapSerializer,
  transactionBuilder,
} from '@metaplex-foundation/umi';

// Arguments.
export type SetComputeUnitPriceInstructionData = {
  discriminator: number;
  /** Transaction compute unit price used for prioritization fees. */
  lamports: SolAmount;
};

export type SetComputeUnitPriceInstructionDataArgs = {
  /** Transaction compute unit price used for prioritization fees. */
  lamports: SolAmount;
};

export function getSetComputeUnitPriceInstructionDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<
  SetComputeUnitPriceInstructionDataArgs,
  SetComputeUnitPriceInstructionData
> {
  const s = context.serializer;
  return mapSerializer<
    SetComputeUnitPriceInstructionDataArgs,
    SetComputeUnitPriceInstructionData,
    SetComputeUnitPriceInstructionData
  >(
    s.struct<SetComputeUnitPriceInstructionData>(
      [
        ['discriminator', s.u8()],
        ['lamports', mapAmountSerializer(s.u64(), 'SOL', 9)],
      ],
      { description: 'SetComputeUnitPriceInstructionData' }
    ),
    (value) =>
      ({ ...value, discriminator: 3 } as SetComputeUnitPriceInstructionData)
  ) as Serializer<
    SetComputeUnitPriceInstructionDataArgs,
    SetComputeUnitPriceInstructionData
  >;
}

// Instruction.
export function setComputeUnitPrice(
  context: Pick<Context, 'serializer' | 'programs'>,
  input: SetComputeUnitPriceInstructionDataArgs
): TransactionBuilder {
  const signers: Signer[] = [];
  const keys: AccountMeta[] = [];

  // Program ID.
  const programId = context.programs.getPublicKey(
    'splComputeBudget',
    'ComputeBudget111111111111111111111111111111'
  );

  // Data.
  const data =
    getSetComputeUnitPriceInstructionDataSerializer(context).serialize(input);

  // Bytes Created On Chain.
  const bytesCreatedOnChain = 0;

  return transactionBuilder([
    { instruction: { keys, programId, data }, signers, bytesCreatedOnChain },
  ]);
}