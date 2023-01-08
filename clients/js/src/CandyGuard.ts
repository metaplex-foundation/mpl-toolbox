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
  getCandyGuardAccountDataSerializer as getBaseCandyGuardAccountDataSerializer,
  CandyGuardAccountData as BaseCandyGuardAccountData,
  CandyGuardAccountArgs as BaseCandyGuardAccountArgs,
} from './generated/accounts/CandyGuard';
import { CandyGuardsSettings, DefaultCandyGuardSettings } from './guards';

export type CandyGuard<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
> = Account<CandyGuardAccountData<T>>;

export type CandyGuardAccountData<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
> = {
  /** Identifies the account as a Candy Guard account. */
  discriminator: Array<number>;

  /** The address used to derive the Candy Guard's PDA. */
  base: PublicKey;

  /** The bump seed used to derive the Candy Guard's PDA. */
  bump: number;

  /** The address allowed to update the Candy Guard account */
  authority: PublicKey;

  /**
   * This object provides the settings for all guards in the Candy Guard.
   *
   * If a guard is set to `null`, it is disabled. Otherwise, it is enabled and
   * the object contains the settings for that guard.
   */
  guards: T;

  /**
   * This parameter allows us to create multiple minting groups that have their
   * own set of requirements — i.e. guards.
   *
   * When groups are provided, the `guards` parameter becomes a set of default
   * guards that will be applied to all groups. If a specific group enables
   * a guard that is also present in the default guards, the group's guard
   * will override the default guard.
   *
   * Each group functions the same way as the `guards` parameter, where a guard
   * is enabled if and only if it is not `null`.
   */
  groups: { label: string; guards: T }[];
};

export type CandyGuardAccountArgs<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
> = CandyGuardAccountData<T>;

export async function fetchCandyGuard<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
>(
  context: Pick<Context, 'rpc' | 'serializer'>,
  address: PublicKey
): Promise<CandyGuard<T>> {
  const maybeAccount = await context.rpc.getAccount(address);
  assertAccountExists(maybeAccount, 'CandyGuard');
  return deserializeCandyGuard(context, maybeAccount);
}

export async function safeFetchCandyGuard<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
>(
  context: Pick<Context, 'rpc' | 'serializer'>,
  address: PublicKey
): Promise<CandyGuard<T> | null> {
  const maybeAccount = await context.rpc.getAccount(address);
  return maybeAccount.exists
    ? deserializeCandyGuard(context, maybeAccount)
    : null;
}

export function deserializeCandyGuard<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
>(context: Pick<Context, 'serializer'>, rawAccount: RpcAccount): CandyGuard<T> {
  return deserializeAccount(
    rawAccount,
    getCandyGuardAccountDataSerializer(context)
  );
}

export function getCandyGuardAccountDataSerializer<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
>(
  context: Pick<Context, 'serializer'>
): Serializer<CandyGuardAccountArgs<T>, CandyGuardAccountData<T>> {
  return mapSerializer(
    getBaseCandyGuardAccountDataSerializer(context),
    (value: CandyGuardAccountArgs<T>): BaseCandyGuardAccountArgs => value,
    (value: BaseCandyGuardAccountData): CandyGuardAccountData<T> => value
  );
}
