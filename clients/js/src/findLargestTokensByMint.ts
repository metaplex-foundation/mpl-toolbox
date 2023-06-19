import {
  Amount,
  Context,
  PublicKey,
  publicKey,
  RpcResultWithContext,
  createAmount,
  RpcCallOptions,
} from '@metaplex-foundation/umi';

export type FindLargestTokensByMintResult = Array<{
  publicKey: PublicKey;
  amount: Amount<'splToken'>;
}>;

export const findLargestTokensByMint = async (
  context: Pick<Context, 'rpc'>,
  mint: PublicKey,
  options: RpcCallOptions = {}
): Promise<FindLargestTokensByMintResult> => {
  const result = await context.rpc.call<
    RpcResultWithContext<
      Array<{
        address: string;
        amount: string;
        decimals: number;
      }>
    >
  >('getTokenLargestAccounts', [mint], options);
  return result.value.map(({ address, amount, decimals }) => ({
    publicKey: publicKey(address),
    amount: createAmount(amount, 'splToken', decimals),
  }));
};
