import { u8 } from '@metaplex-foundation/umi/serializers';
import {
  ExtensionArgs,
  getExtensionSerializer,
  hiddenPrefix,
  padLeftSerializer,
  remainderArray,
} from '../generated-token2022';

const MINT_BASE_SIZE = 82;
// A `Multisig` account is 355 bytes. Token-2022 never lets an extension account
// land on that exact length (it would be indistinguishable from a multisig), so
// on-chain `try_calculate_account_len` pads such an account by the size of an
// `ExtensionType` (a `u16`, i.e. 2 bytes). Mirror that here.
const MULTISIG_LEN = 355;
const EXTENSION_TYPE_SIZE = 2;

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
  const size = MINT_BASE_SIZE + tlvSerializer.serialize(extensions).length;
  return size === MULTISIG_LEN ? size + EXTENSION_TYPE_SIZE : size;
}
