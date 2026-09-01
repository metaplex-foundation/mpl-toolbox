import { u8 } from '@metaplex-foundation/umi/serializers';
import {
  ExtensionArgs,
  getExtensionSerializer,
  hiddenPrefix,
  remainderArray,
} from '../generated-token2022';

const TOKEN_BASE_SIZE = 165;

/**
 * Returns the byte size of a Token-2022 token account, optionally including the
 * given extensions. Passing `undefined` (no extensions) returns the base size
 * with no extension TLV region; passing an array (even empty) accounts for the
 * account-type byte and the extension prefix.
 */
export function getTokenSize(extensions?: ExtensionArgs[]): number {
  if (extensions == null) return TOKEN_BASE_SIZE;
  const tlvSerializer = hiddenPrefix(remainderArray(getExtensionSerializer()), [
    u8().serialize(2),
  ]);
  return TOKEN_BASE_SIZE + tlvSerializer.serialize(extensions).length;
}
