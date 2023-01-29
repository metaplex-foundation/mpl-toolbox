import {
  Context,
  displayPublicKey,
  PublicKey,
  RpcResultWithContext,
} from '@lorisleiva/js-core';

export const findLargestTokens = async (
  context: Pick<Context, 'rpc' | 'serializer'>,
  mint: PublicKey
) => {
  const response: any = await context.rpc.call<
    RpcResultWithContext<any>,
    [string, any]
  >('getTokenLargestAccounts', [
    displayPublicKey(mint),
    { commitment: 'processed' }, // TODO: fix in JS Core.
  ]);
  return response.result.value;
};
