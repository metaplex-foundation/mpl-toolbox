import {
  Serializer,
  mergeBytes,
  u8,
} from '@metaplex-foundation/umi/serializers';
import {
  BatchedTokenInstruction,
  BatchedTokenInstructionArgs,
  getBatchedTokenInstructionSerializer,
} from '../generated/types';

export type BatchTokenInstructionsInstructionData = {
  discriminator: number;
  instructions: Array<BatchedTokenInstruction>;
};

export type BatchTokenInstructionsInstructionDataArgs = {
  instructions: Array<BatchedTokenInstructionArgs>;
};

/**
 * Serializes the data of the SPL Token batch instruction: a `u8`
 * discriminator followed by the batched instructions until the end
 * of the buffer. Each batched instruction has a variable size, which
 * Umi's remainder-sized `array` serializer does not support.
 */
export function getBatchTokenInstructionsInstructionDataSerializer(): Serializer<
  BatchTokenInstructionsInstructionDataArgs,
  BatchTokenInstructionsInstructionData
> {
  const discriminatorSerializer = u8();
  const itemSerializer = getBatchedTokenInstructionSerializer();
  return {
    description: 'BatchTokenInstructionsInstructionData',
    fixedSize: null,
    maxSize: null,
    serialize: (value) =>
      mergeBytes([
        discriminatorSerializer.serialize(255),
        ...value.instructions.map((instruction) =>
          itemSerializer.serialize(instruction)
        ),
      ]),
    deserialize: (bytes, offset = 0) => {
      const [discriminator, discriminatorOffset] =
        discriminatorSerializer.deserialize(bytes, offset);
      const instructions: BatchedTokenInstruction[] = [];
      let currentOffset = discriminatorOffset;
      while (currentOffset < bytes.length) {
        const [instruction, nextOffset] = itemSerializer.deserialize(
          bytes,
          currentOffset
        );
        instructions.push(instruction);
        currentOffset = nextOffset;
      }
      return [{ discriminator, instructions }, currentOffset];
    },
  };
}
