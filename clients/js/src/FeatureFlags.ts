/* eslint-disable no-restricted-syntax */
/* eslint-disable no-bitwise */
import type { Context, Serializer } from '@lorisleiva/js-core';

export type FeatureFlags = boolean[];

/**
 * Serializes an array of boolean into a fixed-size Buffer.
 *
 * Returns a Buffer whose bits are ordered from left to right, unless
 * `backward` is set to true, in which case the bits are ordered from
 * right to left.
 */
export const getFeatureFlagSerializer = (
  context: Pick<Context, 'serializer'>,
  byteSize: number,
  backward = false
): Serializer<FeatureFlags> => ({
  description: 'FeatureFlags',
  serialize: (features) => {
    const bytes: number[] = [];

    for (let i = 0; i < byteSize; i += 1) {
      let byte = 0;
      for (let j = 0; j < 8; j += 1) {
        const feature = Number(features[i * 8 + j] ?? 0);
        byte |= feature << (backward ? j : 7 - j);
      }
      if (backward) {
        bytes.unshift(byte);
      } else {
        bytes.push(byte);
      }
    }

    return new Uint8Array(bytes);
  },
  deserialize: (buffer, offset = 0) => {
    const booleans: boolean[] = [];
    let bytes = buffer.slice(0, byteSize);
    if (backward) bytes = bytes.reverse();

    for (let byte of bytes) {
      for (let i = 0; i < 8; i += 1) {
        if (backward) {
          booleans.push(Boolean(byte & 1));
          byte >>= 1;
        } else {
          booleans.push(Boolean(byte & 0b1000_0000));
          byte <<= 1;
        }
      }
    }

    return [
      booleans.slice(0, byteSize ? byteSize * 8 : undefined),
      offset + bytes.length,
    ];
  },
});
