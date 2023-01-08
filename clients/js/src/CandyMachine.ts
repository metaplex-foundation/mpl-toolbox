import {
  Account,
  assertAccountExists,
  Context,
  deserializeAccount,
  mapSerializer,
  none,
  PercentAmount,
  PublicKey,
  removeNullCharacters,
  RpcAccount,
  Serializer,
  some,
  toAmount,
  unwrapSome,
} from '@lorisleiva/js-core';
import { deserializeCandyMachineHiddenSection } from './CandyMachineHiddenSection';
import { CandyMachineItem } from './CandyMachineItem';
import {
  CandyMachineConfigLineSettings,
  CandyMachineHiddenSettings,
} from './CandyMachineItemSettings';
import { CANDY_MACHINE_HIDDEN_SECTION } from './constants';
import {
  FeatureFlags,
  getFeatureFlagsFromNumber,
  getNumberFromFeatureFlags,
} from './FeatureFlags';
import { Creator } from './generated';
import {
  CandyMachineAccountArgs as BaseCandyMachineAccountArgs,
  CandyMachineAccountData as BaseCandyMachineAccountData,
  getCandyMachineAccountDataSerializer as getBaseCandyMachineAccountDataSerializer,
} from './generated/accounts/CandyMachine';

export type CandyMachine = Account<CandyMachineAccountData>;

export type CandyMachineAccountData = {
  /** Identifies the account as a Candy Machine account. */
  discriminator: Array<number>;

  /** Features versioning flags. */
  features: FeatureFlags;

  /**
   * Refers to the authority that is allowed to manage the Candy Machine.
   * This includes updating its data, authorities, inserting items, etc.
   */
  authority: PublicKey;

  /**
   * Refers to the only authority that is allowed to mint from
   * this Candy Machine. This will refer to the address of the Candy
   * Guard associated with the Candy Machine if any.
   */
  mintAuthority: PublicKey;

  /** The collection mint for the candy machine. */
  collectionMint: PublicKey;

  /**
   * The symbol to use when minting NFTs (e.g. "MYPROJECT")
   *
   * This can be any string up to 10 bytes and can be made optional
   * by providing an empty string.
   */
  symbol: string;

  /**
   * The royalties that should be set on minted NFTs in basis points
   * (i.e. 250 is 2.5%).
   */
  sellerFeeBasisPoints: PercentAmount<2>;

  /**
   * The maximum number of editions that can be printed from the
   * minted NFTs.
   *
   * For most use cases, you'd want to set this to `0` to prevent
   * minted NFTs to be printed multiple times.
   *
   * Note that you cannot set this to `null` which means unlimited editions
   * are not supported by the Candy Machine program.
   */
  maxEditionSupply: bigint;

  /**
   * Whether the minted NFTs should be mutable or not.
   *
   * We recommend setting this to `true` unless you have a specific reason.
   * You can always make NFTs immutable in the future but you cannot make
   * immutable NFTs mutable ever again.
   */
  isMutable: boolean;

  /**
   * Array of creators that should be set on minted NFTs.
   * creators can only verify NFTs after they have been minted.
   * Thus, all the provided creators will have `verified` set to `false`.
   *
   * @see {@link Creator}
   */
  creators: Array<Omit<Creator, 'verified'>>;

  /**
   * Settings related to the Candy Machine's items.
   *
   * These can either be inserted manually within the Candy Machine or
   * they can be infered from a set of hidden settings.
   *
   * - If `type` is `hidden`, the Candy Machine is using hidden settings.
   * - If `type` is `configLines`, the Candy Machine is using config line settings.
   *
   * @see {@link CandyMachineHiddenSettings}
   * @see {@link CandyMachineConfigLineSettings}
   */
  itemSettings: CandyMachineHiddenSettings | CandyMachineConfigLineSettings;

  /**
   * The parsed items that are loaded in the Candy Machine.
   *
   * If the Candy Machine is using hidden settings,
   * this will be an empty array.
   *
   * @see {@link CandyMachineItem}
   */
  items: CandyMachineItem[];

  /**
   * The total number of items availble in the Candy Machine, minted or not.
   */
  itemsAvailable: bigint;

  /**
   * The number of items that have been minted on this Candy Machine so far.
   */
  itemsMinted: bigint;

  /**
   * The number of remaining items in the Candy Machine that can still be minted.
   */
  itemsRemaining: bigint;

  /**
   * The number of items that have been inserted in the Candy Machine by
   * its update authority. If this number if lower than the number of items
   * available, the Candy Machine is not ready and cannot be minted from.
   *
   * This field is irrelevant if the Candy Machine is using hidden settings.
   */
  itemsLoaded: number;

  /**
   * Whether all items in the Candy Machine have been inserted by
   * its authority.
   *
   * This field is irrelevant if the Candy Machine is using hidden settings.
   */
  isFullyLoaded: boolean;
};

export type CandyMachineAccountArgs = Omit<
  CandyMachineAccountData,
  'discriminator' | 'items' | 'itemsLoaded' | 'itemsRemaining' | 'isFullyLoaded'
>;

export async function fetchCandyMachine(
  context: Pick<Context, 'rpc' | 'serializer'>,
  address: PublicKey
): Promise<CandyMachine> {
  const maybeAccount = await context.rpc.getAccount(address);
  assertAccountExists(maybeAccount, 'CandyMachine');
  return deserializeCandyMachine(context, maybeAccount);
}

export async function safeFetchCandyMachine(
  context: Pick<Context, 'rpc' | 'serializer'>,
  address: PublicKey
): Promise<CandyMachine | null> {
  const maybeAccount = await context.rpc.getAccount(address);
  return maybeAccount.exists
    ? deserializeCandyMachine(context, maybeAccount)
    : null;
}

export function deserializeCandyMachine(
  context: Pick<Context, 'serializer'>,
  rawAccount: RpcAccount
): CandyMachine {
  return deserializeAccount(
    rawAccount,
    getCandyMachineAccountDataSerializer(context)
  );
}

export function getCandyMachineAccountDataSerializer(
  context: Pick<Context, 'serializer'>
): Serializer<CandyMachineAccountData> {
  return mapSerializer(
    getBaseCandyMachineAccountDataSerializer(context),
    (candyMachine: CandyMachineAccountArgs): BaseCandyMachineAccountArgs => ({
      ...candyMachine,
      features: getNumberFromFeatureFlags(candyMachine.features, 8),
      itemsRedeemed: candyMachine.itemsMinted,
      data: {
        ...candyMachine,
        maxSupply: candyMachine.maxEditionSupply,
        sellerFeeBasisPoints: Number(
          candyMachine.sellerFeeBasisPoints.basisPoints
        ),
        creators: candyMachine.creators.map((creator) => ({
          ...creator,
          verified: false,
        })),
        configLineSettings:
          candyMachine.itemSettings.type === 'configLines'
            ? some(candyMachine.itemSettings)
            : none(),
        hiddenSettings:
          candyMachine.itemSettings.type === 'hidden'
            ? some(candyMachine.itemSettings)
            : none(),
      },
    }),
    (
      base: BaseCandyMachineAccountData,
      buffer: Uint8Array,
      offset: number
    ): CandyMachineAccountData => {
      const hiddenSettings = unwrapSome(base.data.hiddenSettings);
      const configLineSettings = unwrapSome(base.data.configLineSettings);
      let items: CandyMachineItem[] = [];
      let itemsLoaded = 0;
      let isFullyLoaded = true;
      let itemSettings:
        | CandyMachineHiddenSettings
        | CandyMachineConfigLineSettings;

      if (hiddenSettings) {
        itemSettings = { ...hiddenSettings, type: 'hidden' };
      } else if (!configLineSettings) {
        // TODO: Custom errors.
        throw new Error('Expected either hidden or config line settings');
      } else {
        itemSettings = { ...configLineSettings, type: 'configLines' };
        const hiddenSection = deserializeCandyMachineHiddenSection(
          context,
          buffer,
          Number(base.data.itemsAvailable),
          Number(base.data.itemsAvailable - base.itemsRedeemed),
          itemSettings,
          offset + CANDY_MACHINE_HIDDEN_SECTION
        );

        items = hiddenSection.items;
        itemsLoaded = hiddenSection.itemsLoaded;
        isFullyLoaded = hiddenSection.itemsLoaded >= base.data.itemsAvailable;
      }

      return {
        discriminator: base.discriminator,
        features: getFeatureFlagsFromNumber(base.features, 8),
        authority: base.authority,
        mintAuthority: base.mintAuthority,
        collectionMint: base.collectionMint,
        symbol: removeNullCharacters(base.data.symbol),
        sellerFeeBasisPoints: toAmount(base.data.sellerFeeBasisPoints, '%', 2),
        maxEditionSupply: base.data.maxSupply,
        isMutable: base.data.isMutable,
        creators: base.data.creators,
        itemSettings,
        items,
        itemsAvailable: base.data.itemsAvailable,
        itemsMinted: base.itemsRedeemed,
        itemsRemaining: base.data.itemsAvailable - base.itemsRedeemed,
        itemsLoaded,
        isFullyLoaded,
      };
    }
  );
}
