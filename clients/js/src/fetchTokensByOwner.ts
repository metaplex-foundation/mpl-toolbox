import {
  base58PublicKey,
  Context,
  lamports,
  PublicKey,
  publicKey,
  RpcCallOptions,
  RpcResultWithContext,
} from '@lorisleiva/js-core';
import { deserializeToken, Token } from './generated';

export const fetchTokensByOwner = async (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  options: RpcCallOptions = {}
): Promise<Array<Token>> => {
  const splToken = context.programs.get('splToken').publicKey;
  const result = await context.rpc.call<
    RpcResultWithContext<
      Array<{
        pubkey: string;
        account: {
          data: [string, string];
          executable: boolean;
          lamports: number;
          owner: string;
          rentEpoch: number;
        };
      }>
    >
  >(
    'getTokenAccountsByOwner',
    [base58PublicKey(owner), { programId: base58PublicKey(splToken) }],
    { ...options, extra: { ...options.extra, encoding: 'base64' } }
  );
  console.log({ result: result.value[0].account.data });
  return result.value.map(({ pubkey, account }) =>
    deserializeToken(context, {
      ...account,
      data: Uint8Array.from(atob(account.data[0]), (c) => c.charCodeAt(0)),
      publicKey: publicKey(pubkey),
      owner: publicKey(account.owner),
      lamports: lamports(account.lamports),
    })
  );
};
