import { u8 } from '@metaplex-foundation/umi/serializers';
import {
  ExtensionArgs,
  getExtensionSerializer,
  hiddenPrefix,
  padLeftSerializer,
  remainderArray,
} from '../generated-token2022';

const MINT_BASE_SIZE = 82;

/**
 * Returns the byte size of a Token-2022 mint account, optionally including the
 * given extensions. Passing `undefined` (no extensions) returns the base size
 * with no extension TLV region; passing an array (even empty) accounts for the
 * account-type byte and the extension prefix.
 */
export function getMintSize(extensions?: ExtensionArgs[]): number {
  if (extensions == null) return MINT_BASE_SIZE;
  const tlvSerializer = hiddenPrefix(remainderArray(getExtensionSerializer()), [
    padLeftSerializer(u8(), 83).serialize(1),
  ]);
  return MINT_BASE_SIZE + tlvSerializer.serialize(extensions).length;
}
