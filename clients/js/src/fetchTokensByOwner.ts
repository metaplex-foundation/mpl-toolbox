import {
  base58PublicKey,
  base64,
  Context,
  lamports,
  PublicKey,
  publicKey,
  RpcBaseOptions,
  RpcResultWithContext,
} from '@metaplex-foundation/umi';
import {
  deserializeToken,
  fetchAllMint,
  getTokenGpaBuilder,
  Mint,
  Token,
} from './generated';

/**
 * The strategy to use when fetching token accounts.
 * - `getProgramAccounts` is the default and uses the `getProgramAccounts` RPC call.
 * It is faster but may be disabled on some RPC nodes.
 * - `getTokenAccountsByOwner` uses the `getTokenAccountsByOwner` RPC call.
 *
 * @defaultValue `'getProgramAccounts'`
 */
export type FetchTokenStrategy =
  | 'getProgramAccounts'
  | 'getTokenAccountsByOwner';

/**
 * A callback to filter token accounts by their amount.
 *
 * @defaultValue `(amount) => amount > 0`
 */
export type FetchTokenAmountFilter = (amount: bigint) => boolean;

type RawTokenAccountByOwner = {
  pubkey: string;
  account: {
    data: [string, string];
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
};

const getTokenAccountsByOwnerCall = async (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  amountFilter: FetchTokenAmountFilter,
  options: RpcBaseOptions & { mint?: PublicKey } = {}
): Promise<RawTokenAccountByOwner[]> => {
  const splToken = context.programs.get('splToken').publicKey;
  const filter = options.mint
    ? { mint: base58PublicKey(options.mint) }
    : { programId: base58PublicKey(splToken) };
  const result = await context.rpc.call<
    RpcResultWithContext<RawTokenAccountByOwner[]>
  >('getTokenAccountsByOwner', [base58PublicKey(owner), filter], {
    ...options,
    extra: { encoding: 'base64' },
  });
  return result.value.filter(({ account }) => {
    const data = base64.serialize(account.data[0]);
    const u64 = context.serializer.u64();
    const amount = u64.deserialize(data.slice(64, 72))[0];
    return amountFilter(amount);
  });
};

export const fetchAllTokenByOwner = async (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  options: RpcBaseOptions & {
    mint?: PublicKey;
    strategy?: FetchTokenStrategy;
    amountFilter?: FetchTokenAmountFilter;
  } = {}
): Promise<Array<Token>> => {
  const {
    mint,
    strategy = 'getProgramAccounts',
    amountFilter = (amount) => amount > 0,
    ...rpcOptions
  } = options;

  if (strategy === 'getTokenAccountsByOwner') {
    const result = await getTokenAccountsByOwnerCall(
      context,
      owner,
      amountFilter,
      { mint, ...rpcOptions }
    );
    return result.map(({ pubkey, account }) =>
      deserializeToken(context, {
        ...account,
        data: base64.serialize(account.data[0]),
        publicKey: publicKey(pubkey),
        owner: publicKey(account.owner),
        lamports: lamports(account.lamports),
      })
    );
  }

  let builder = getTokenGpaBuilder(context).whereField('owner', owner);
  if (mint) {
    builder = builder.whereField('mint', mint);
  }

  return (await builder.get())
    .filter((account) => {
      const u64 = context.serializer.u64();
      const amount = u64.deserialize(account.data.slice(64, 72))[0];
      return amountFilter(amount);
    })
    .map((account) => deserializeToken(context, account));
};

export const fetchAllTokenByOwnerAndMint = (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  mint: PublicKey,
  options: RpcBaseOptions & {
    strategy?: FetchTokenStrategy;
    amountFilter?: FetchTokenAmountFilter;
  } = {}
): Promise<Array<Token>> =>
  fetchAllTokenByOwner(context, owner, { ...options, mint });

export const fetchAllMintPublicKeyByOwner = async (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  options: RpcBaseOptions & {
    strategy?: FetchTokenStrategy;
    amountFilter?: FetchTokenAmountFilter;
  } = {}
): Promise<Array<PublicKey>> => {
  const {
    strategy = 'getProgramAccounts',
    amountFilter = (amount) => amount > 0,
    ...rpcOptions
  } = options;

  if (strategy === 'getTokenAccountsByOwner') {
    const result = await getTokenAccountsByOwnerCall(
      context,
      owner,
      amountFilter,
      rpcOptions
    );
    return result.map(({ account }) =>
      publicKey(base64.serialize(account.data[0]).slice(0, 32))
    );
  }

  return (
    await getTokenGpaBuilder(context)
      .slice(0, 72) // Includes mint, owner and amount.
      .whereField('owner', owner)
      .get()
  )
    .filter((account) => {
      const u64 = context.serializer.u64();
      const amount = u64.deserialize(account.data.slice(64, 72))[0];
      return amountFilter(amount);
    })
    .map((account) => publicKey(account.data.slice(0, 32)));
};

export const fetchAllMintByOwner = async (
  context: Pick<Context, 'rpc' | 'serializer' | 'programs'>,
  owner: PublicKey,
  options: RpcBaseOptions & {
    tokenStrategy?: FetchTokenStrategy;
    tokenAmountFilter?: FetchTokenAmountFilter;
  } = {}
): Promise<Array<Mint>> => {
  const { tokenStrategy, tokenAmountFilter, ...rpcOptions } = options;
  const mints = await fetchAllMintPublicKeyByOwner(context, owner, options);
  return fetchAllMint(context, mints, rpcOptions);
};

/** @deprecated Use fetchAllTokenByOwner instead. Worry not, it has the same signature. */
export const fetchTokensByOwner = fetchAllTokenByOwner;

/** @deprecated Use fetchAllTokenByOwnerAndMint instead. Worry not, it has the same signature. */
export const fetchTokensByOwnerAndMint = fetchAllTokenByOwnerAndMint;
