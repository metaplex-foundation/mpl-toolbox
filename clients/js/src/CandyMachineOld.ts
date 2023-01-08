import { Account, PublicKey } from '@lorisleiva/js-core';
import { CandyMachineItem } from './CandyMachineItem';
import { FeatureFlags } from './FeatureFlags';
import { CandyMachineData, Creator } from './generated';
import { CandyMachine as BaseCandyMachine } from './generated/accounts/CandyMachine';

/**
 * This model contains all the relevant information about a Candy Machine.
 * This includes its settings but also all of the items (a.k.a. config lines)
 * loaded inside the Candy Machine along with some statistics about the items.
 */
export type CandyMachine<
  // T extends CandyGuardsSettings = DefaultCandyGuardSettings
> = Omit<Account<BaseCandyMachine>, 'data'> & {
  /**
   * Refers to the authority that is allowed to manage the Candy Machine.
   * This includes updating its data, authorities, inserting items, etc.
   */
  readonly authorityAddress: PublicKey;

  /**
   * Refers to the only authority that is allowed to mint from
   * this Candy Machine. This will refer to the address of the Candy
   * Guard associated with the Candy Machine if any.
   */
  readonly mintAuthorityAddress: PublicKey;

  /**
   * The mint address of the collection NFT that should be associated with
   * minted NFTs. When `null`, it means NFTs will not be part of a
   * collection when minted.
   */
  readonly collectionMintAddress: PublicKey;

  /**
   * The symbol to use when minting NFTs (e.g. "MYPROJECT")
   *
   * This can be any string up to 10 bytes and can be made optional
   * by providing an empty string.
   */
  readonly symbol: string;

  /**
   * The royalties that should be set on minted NFTs in basis points
   * (i.e. 250 is 2.5%).
   */
  readonly sellerFeeBasisPoints: number;

  /**
   * Whether the minted NFTs should be mutable or not.
   *
   * We recommend setting this to `true` unless you have a specific reason.
   * You can always make NFTs immutable in the future but you cannot make
   * immutable NFTs mutable ever again.
   */
  readonly isMutable: boolean;

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
  readonly maxEditionSupply: bigint;

  /**
   * Array of creators that should be set on minted NFTs.
   * creators can only verify NFTs after they have been minted.
   * Thus, all the provided creators will have `verified` set to `false`.
   *
   * @see {@link Creator}
   */
  readonly creators: Omit<Creator, 'verified'>[];

  /**
   * The parsed items that are loaded in the Candy Machine.
   *
   * If the Candy Machine is using hidden settings,
   * this will be an empty array.
   */
  readonly items: CandyMachineItem[];

  /**
   * The total number of items availble in the Candy Machine, minted or not.
   */
  readonly itemsAvailable: bigint;

  /**
   * The number of items that have been minted on this Candy Machine so far.
   */
  readonly itemsMinted: bigint;

  /**
   * The number of remaining items in the Candy Machine that can still be minted.
   */
  readonly itemsRemaining: bigint;

  /**
   * The number of items that have been inserted in the Candy Machine by
   * its update authority. If this number if lower than the number of items
   * available, the Candy Machine is not ready and cannot be minted from.
   *
   * This field is irrelevant if the Candy Machine is using hidden settings.
   */
  readonly itemsLoaded: number;

  /**
   * Whether all items in the Candy Machine have been inserted by
   * its authority.
   *
   * This field is irrelevant if the Candy Machine is using hidden settings.
   */
  readonly isFullyLoaded: boolean;

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
  readonly itemSettings:
    | CandyMachineHiddenSettings
    | CandyMachineConfigLineSettings;

  /**
   * This array of booleans is used to keep track of which
   * new features have been enabled on the Candy Machine.
   */
  readonly featureFlags: FeatureFlags;

  /**
   * The Candy Guard associted with the Candy Machine if any.
   */
  readonly candyGuard: CandyGuard<T> | null;
};

/** @group Model Helpers */
export const toCandyMachine = <
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
>(
  account: UnparsedAccount,
  candyGuard: Option<CandyGuard<T>> = null
): CandyMachine<T> => {
  const serializer = createSerializerFromSolitaType(
    MplCandyMachine,
    candyMachineBeet.description
  );
  const parsedAccount = deserializeAccount(account, serializer);

  const itemsAvailable = toBigNumber(parsedAccount.data.data.itemsAvailable);
  const itemsMinted = toBigNumber(parsedAccount.data.itemsRedeemed);
  const itemsRemaining = toBigNumber(itemsAvailable.sub(itemsMinted));

  let items: CandyMachineItem[] = [];
  let itemsLoaded = 0;
  let isFullyLoaded = true;

  const { hiddenSettings } = parsedAccount.data.data;
  const { configLineSettings } = parsedAccount.data.data;
  let itemSettings: CandyMachineHiddenSettings | CandyMachineConfigLineSettings;
  if (hiddenSettings) {
    itemSettings = { ...hiddenSettings, type: 'hidden' };
  } else {
    assert(
      !!configLineSettings,
      'Expected either hidden or config line settings'
    );
    itemSettings = { ...configLineSettings, type: 'configLines' };
    const hiddenSection = deserializeCandyMachineHiddenSection(
      account.data,
      itemsAvailable.toNumber(),
      itemsRemaining.toNumber(),
      itemSettings,
      CANDY_MACHINE_HIDDEN_SECTION
    );

    items = hiddenSection.items;
    itemsLoaded = hiddenSection.itemsLoaded;
    isFullyLoaded = hiddenSection.itemsLoaded >= itemsAvailable.toNumber();
  }

  return {
    model: 'candyMachine',
    address: account.publicKey,
    accountInfo: toAccountInfo(account),
    authorityAddress: parsedAccount.data.authority,
    mintAuthorityAddress: parsedAccount.data.mintAuthority,
    collectionMintAddress: parsedAccount.data.collectionMint,
    symbol: removeEmptyChars(parsedAccount.data.data.symbol),
    sellerFeeBasisPoints: parsedAccount.data.data.sellerFeeBasisPoints,
    isMutable: parsedAccount.data.data.isMutable,
    maxEditionSupply: toBigNumber(parsedAccount.data.data.maxSupply),
    creators: parsedAccount.data.data.creators.map(
      (creator): Creator => ({ ...creator, share: creator.percentageShare })
    ),
    items,
    itemsAvailable,
    itemsMinted,
    itemsRemaining,
    itemsLoaded,
    isFullyLoaded,
    itemSettings,
    featureFlags: deserializeFeatureFlags(
      toBigNumber(parsedAccount.data.features)
        .toArrayLike(Buffer, 'le', 8)
        .reverse(),
      64
    ),
    candyGuard,
  };
};

export const toCandyMachineData = (
  candyMachine: Pick<
    CandyMachine,
    | 'itemsAvailable'
    | 'symbol'
    | 'sellerFeeBasisPoints'
    | 'maxEditionSupply'
    | 'isMutable'
    | 'creators'
    | 'itemSettings'
  >
): CandyMachineData => ({
  itemsAvailable: candyMachine.itemsAvailable,
  symbol: candyMachine.symbol,
  sellerFeeBasisPoints: candyMachine.sellerFeeBasisPoints,
  maxSupply: candyMachine.maxEditionSupply,
  isMutable: candyMachine.isMutable,
  creators: candyMachine.creators.map((creator) => ({
    ...creator,
    verified: false,
    percentageShare: creator.share,
  })),
  configLineSettings:
    candyMachine.itemSettings.type === 'configLines'
      ? candyMachine.itemSettings
      : null,
  hiddenSettings:
    candyMachine.itemSettings.type === 'hidden'
      ? candyMachine.itemSettings
      : null,
});

export const getCandyMachineSize = (data: CandyMachineData): number => {
  if (data.hiddenSettings) {
    return CANDY_MACHINE_HIDDEN_SECTION;
  }

  // This should not happen as the candy machine input type
  // ensures exactly on of them is provided.
  assert(
    !!data.configLineSettings,
    'No config line settings nor hidden settings were provided. ' +
      'Please provide one of them.'
  );

  const itemsAvailable = BigInt(data.itemsAvailable);
  const configLineSize =
    data.configLineSettings.nameLength + data.configLineSettings.uriLength;

  return Math.ceil(
    CANDY_MACHINE_HIDDEN_SECTION +
      // Number of currently items inserted.
      4 +
      // Config line data.
      itemsAvailable * configLineSize +
      // Bit mask to keep track of which ConfigLines have been added.
      (4 + Math.floor(itemsAvailable / 8) + 1) +
      // Mint indices.
      (4 + itemsAvailable * 4)
  );
};
