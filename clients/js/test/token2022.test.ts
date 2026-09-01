import { RpcAccount, lamports, publicKey } from '@metaplex-foundation/umi';
import { base64 } from '@metaplex-foundation/umi/serializers';
import test from 'ava';
import { token2022 } from '../src';

// A real Token-2022 mint created on a local validator with the metadata-pointer,
// transfer-fee and token-metadata extensions, captured as raw account bytes.
// Decoding it exercises the generated Token-2022 codecs that Kinobi 0.16 could
// not express: the remainder-TLV extension list, the hidden account-type prefix,
// and the zeroable-option public keys inside the extension structs.
const MINT_BASE64 =
  'AQAAAIN3XeRrMNc1YhbjwePStcvVH/4fpOdWDL1HOZW0qf/XAAAAAAAAAAAJAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEAbACDd13kazDXNWIW48Hj0rXL1R/+H6TnVgy9RzmVtKn/14N3XeRrMNc1YhbjwePStcvVH/4fpOdWDL1HOZW0qf/XAAAAAAAAAABsBAAAAAAAAEBCDwAAAAAAZABsBAAAAAAAAEBCDwAAAAAAZAASAEAAg3dd5Gsw1zViFuPB49K1y9Uf/h+k51YMvUc5lbSp/9fwTPRtqBLd/gTUhF9LfGwVLqBZWuV7d3S5wSHYhZJ60xMAdACDd13kazDXNWIW48Hj0rXL1R/+H6TnVgy9RzmVtKn/1/BM9G2oEt3+BNSEX0t8bBUuoFla5Xt3dLnBIdiFknrTBwAAAFRlc3RUb2sDAAAAVFNUGgAAAGh0dHBzOi8vZXhhbXBsZS5jb20vdC5qc29uAAAAAA==';

test('the Token-2022 client decodes a mint with its extensions', (t) => {
  const rawAccount: RpcAccount = {
    publicKey: publicKey('HB2ub4SSj6cKBGYNWmTKBTR1qEfndX7kyommg39cB6sC'),
    owner: publicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
    lamports: lamports(0),
    executable: false,
    data: base64.serialize(MINT_BASE64),
  };

  const mint = token2022.deserializeMint(rawAccount);

  t.is(mint.decimals, 9);
  const extensions =
    mint.extensions.__option === 'Some' ? mint.extensions.value : [];
  const kinds = extensions.map((extension) => extension.__kind).sort();
  t.deepEqual(kinds, ['MetadataPointer', 'TokenMetadata', 'TransferFeeConfig']);
});
