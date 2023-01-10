import { Account, PublicKey } from '@lorisleiva/js-core';
import { CandyMachineItem } from './CandyMachineItem';
import { FeatureFlags } from './FeatureFlags';
import { CandyMachineData, Creator } from './generated';
import { CandyMachine as BaseCandyMachine } from './generated/accounts/CandyMachine';

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
