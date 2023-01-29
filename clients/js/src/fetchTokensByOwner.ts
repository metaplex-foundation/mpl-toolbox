import {
  base58PublicKey,
  Context,
  PublicKey,
  RpcCallOptions,
  RpcResultWithContext,
} from '@lorisleiva/js-core';

export const fetchTokensByOwner = async (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  options: RpcCallOptions = {}
): Promise<any> => {
  const splToken = context.programs.get('splToken').publicKey;
  const result = await context.rpc.call<RpcResultWithContext<Array<any>>>(
    'getTokenLargestAccounts',
    [base58PublicKey(owner), { programId: base58PublicKey(splToken) }],
    options
  );
  return result;
  // return result.value.map(({ address, amount, decimals }) => ({
  //   publicKey: publicKey(address),
  //   amount: createAmount(amount, 'splToken', decimals),
  // }));
};
