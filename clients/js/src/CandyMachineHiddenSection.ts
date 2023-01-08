import { Context, removeNullCharacters } from '@lorisleiva/js-core';
import { CandyMachineConfigLineSettings } from './CandyMachineItemSettings';
import { CandyMachineItem } from './CandyMachineItem';
import { getFeatureFlagSerializer } from './FeatureFlags';

/** @internal */
export type CandyMachineHiddenSection = {
  itemsLoaded: number;
  items: CandyMachineItem[];
  itemsLoadedMap: boolean[];
  itemsLeftToMint: number[];
};

/** @internal */
export const deserializeCandyMachineHiddenSection = (
  context: Pick<Context, 'serializer'>,
  buffer: Uint8Array,
  itemsAvailable: number,
  itemsRemaining: number,
  configLineSettings: CandyMachineConfigLineSettings,
  initOffset = 0
): CandyMachineHiddenSection => {
  const s = context.serializer;
  let offset = initOffset;

  // Items loaded.
  const [itemsLoaded] = s.u32.deserialize(buffer, offset);
  offset += 4;

  // Raw config lines.
  const { nameLength, uriLength } = configLineSettings;
  const configLineSize = nameLength + uriLength;
  const configLinesSize = configLineSize * itemsAvailable;
  const rawConfigLines = buffer.slice(offset, offset + configLinesSize);
  offset += configLinesSize;

  // Items loaded map.
  const itemsLoadedBuffer = buffer.slice(offset, offset + itemsAvailable);
  const [itemsLoadedMap] = getFeatureFlagSerializer(s.u64, 8).deserialize(
    itemsLoadedBuffer,
    itemsAvailable
  );
  const itemsLoadedMapSize = Math.floor(itemsAvailable / 8) + 1;
  offset += itemsLoadedMapSize;

  // Items left to mint for random order only.
  const itemsLeftToMint = s
    .array(s.u32, itemsAvailable)
    .deserialize(buffer, offset)[0]
    .slice(0, itemsRemaining);

  // Helper function to figure out if an item has been minted.
  const itemsMinted = itemsAvailable - itemsRemaining;
  const isMinted = (index: number): boolean =>
    configLineSettings.isSequential
      ? index < itemsMinted
      : !itemsLeftToMint.includes(index);

  // Parse config lines.
  const textDecoder = new TextDecoder('utf-8');
  const items: CandyMachineItem[] = [];
  itemsLoadedMap.forEach((loaded, index) => {
    if (!loaded) return;

    const namePosition = index * configLineSize;
    const uriPosition = namePosition + nameLength;
    const name = textDecoder.decode(
      rawConfigLines.slice(namePosition, namePosition + nameLength)
    );
    const uri = textDecoder.decode(
      rawConfigLines.slice(uriPosition, uriPosition + uriLength)
    );
    const prefixName = replaceCandyMachineItemPattern(
      configLineSettings.prefixName,
      index
    );
    const prefixUri = replaceCandyMachineItemPattern(
      configLineSettings.prefixUri,
      index
    );

    items.push({
      index,
      minted: isMinted(index),
      name: prefixName + removeNullCharacters(name),
      uri: prefixUri + removeNullCharacters(uri),
    });
  });

  return {
    itemsLoaded,
    items,
    itemsLoadedMap,
    itemsLeftToMint,
  };
};

/** @internal */
export const replaceCandyMachineItemPattern = (
  value: string,
  index: number
): string =>
  value.replace('$ID+1$', `${index + 1}`).replace('$ID$', `${index}`);
