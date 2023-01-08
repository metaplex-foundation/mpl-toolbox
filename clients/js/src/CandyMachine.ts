import {
  Account,
  assertAccountExists,
  Context,
  deserializeAccount,
  mapSerializer,
  PublicKey,
  RpcAccount,
  Serializer,
} from '@lorisleiva/js-core';
import {
  getCandyMachineSerializer as getBaseCandyMachineSerializer,
  CandyMachine as BaseCandyMachine,
  CandyMachineArgs as BaseCandyMachineArgs,
} from './generated/accounts/CandyMachine';

export type CandyMachine = {
  discriminator: Array<number>;
  /** Features versioning flags. */
  features: bigint;
  /** Authority address. */
  authority: PublicKey;
  /** Authority address allowed to mint from the candy machine. */
  mintAuthority: PublicKey;
  /** The collection mint for the candy machine. */
  collectionMint: PublicKey;
  /** Number of assets redeemed. */
  itemsRedeemed: bigint;

  /** BELOW: Candy machine configuration data. */

  /** Number of assets available */
  itemsAvailable: bigint;
  /** Symbol for the asset */
  symbol: string;
  /** Secondary sales royalty basis points (0-10000) */
  sellerFeeBasisPoints: number;
  /** Max supply of each individual asset (default 0) */
  maxSupply: bigint;
  /** Indicates if the asset is mutable or not (default yes) */
  isMutable: boolean;
  /** List of creators */
  creators: Array<Creator>;
  /** Config line settings */
  configLineSettings: Option<ConfigLineSettings>;
  /** Hidden setttings */
  hiddenSettings: Option<HiddenSettings>;

  // TODO: Remove verified from creators.
  // TODO: is fully loaded.
  // TODO: items settings.
  // TODO: items from hidden section.
  // TODO: feature flags.
  // TODO: candy guard account?
};

export async function fetchCandyMachine(
  context: Pick<Context, 'rpc' | 'serializer'>,
  address: PublicKey
): Promise<Account<CandyMachine>> {
  const maybeAccount = await context.rpc.getAccount(address);
  assertAccountExists(maybeAccount, 'CandyMachine');
  return deserializeCandyMachine(context, maybeAccount);
}

export async function safeFetchCandyMachine(
  context: Pick<Context, 'rpc' | 'serializer'>,
  address: PublicKey
): Promise<Account<CandyMachine> | null> {
  const maybeAccount = await context.rpc.getAccount(address);
  return maybeAccount.exists
    ? deserializeCandyMachine(context, maybeAccount)
    : null;
}

export function deserializeCandyMachine(
  context: Pick<Context, 'serializer'>,
  rawAccount: RpcAccount
): Account<CandyMachine> {
  return deserializeAccount(rawAccount, getCandyMachineSerializer(context));
}

export function getCandyMachineSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<CandyMachine> {
  return mapSerializer(
    getBaseCandyMachineSerializer(context),
    (candyMachine: CandyMachine): BaseCandyMachineArgs => ({
      ...candyMachine,
      data: { ...candyMachine },
    }),
    (baseCandyMachine: BaseCandyMachine): CandyMachine => ({
      ...baseCandyMachine,
      ...baseCandyMachine.data,
    })
  );
}
