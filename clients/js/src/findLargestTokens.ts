import {
  Amount,
  base58PublicKey,
  Context,
  PublicKey,
  publicKey,
  RpcResultWithContext,
  createAmount,
  RpcCallOptions,
} from '@lorisleiva/js-core';

export type FindLargestTokensResult = Array<{
  publicKey: PublicKey;
  amount: Amount<'splToken'>;
}>;

export const findLargestTokens = async (
  context: Pick<Context, 'rpc' | 'serializer'>,
  mint: PublicKey,
  options: RpcCallOptions = {}
): Promise<FindLargestTokensResult> => {
  const result = await context.rpc.call<
    RpcResultWithContext<
      Array<{
        address: string;
        amount: string;
        decimals: number;
      }>
    >
  >('getTokenLargestAccounts', [base58PublicKey(mint)], options);
  return result.value.map(({ address, amount, decimals }) => ({
    publicKey: publicKey(address),
    amount: createAmount(amount, 'splToken', decimals),
  }));
};
