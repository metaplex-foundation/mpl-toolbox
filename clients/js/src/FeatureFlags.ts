/* eslint-disable no-bitwise */

import { mapSerializer, Serializer } from '@lorisleiva/js-core';

export type FeatureFlags = boolean[];

export const getFeatureFlagSerializer = (
  serializer: Serializer<bigint | number, bigint>,
  bytes: number
): Serializer<FeatureFlags> =>
  mapSerializer(
    serializer,
    (f) => getNumberFromFeatureFlags(f, bytes),
    (n: number | bigint) => getFeatureFlagsFromNumber(BigInt(n), bytes)
  );

export const getFeatureFlagsFromNumber = (
  n: bigint,
  bytes: number,
  backwards = false
): FeatureFlags => {
  const f = [...Array(bytes)].map((_, i) => ((n >> BigInt(i)) & 1n) === 1n);
  return backwards ? f.reverse() : f;
};

export const getNumberFromFeatureFlags = (
  features: FeatureFlags,
  bytes: number,
  backwards = false
): bigint => {
  const f = backwards ? features.reverse() : features;
  return [...Array(bytes)]
    .map((_, i) => (f[i] ? 2n ** BigInt(i) : 0n))
    .reduce((acc, v) => acc + v, 0n);
};
