import { UmiPlugin, publicKey } from '@metaplex-foundation/umi';
import {
  createMplSystemExtrasProgram,
  createMplTokenExtrasProgram,
  createSplAddressLookupTableProgram,
  createSplAssociatedTokenProgram,
  createSplMemoProgram,
  createSplSystemProgram,
  createSplTokenProgram,
} from './generated';

export const mplToolbox = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createSplSystemProgram(), false);
    umi.programs.add(createSplMemoProgram(), false);
    umi.programs.add(createSplTokenProgram(), false);
    umi.programs.add(createSplAssociatedTokenProgram(), false);
    umi.programs.add(createSplAddressLookupTableProgram(), false);
    umi.programs.add(createMplSystemExtrasProgram(), false);
    umi.programs.add(createMplTokenExtrasProgram(), false);

    // Token 2022.
    // For now, we just register it as a splToken program for feature parity.
    umi.programs.add(
      {
        ...createSplTokenProgram(),
        name: 'splToken2022',
        publicKey: publicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
      },
      false
    );
  },
});

/** @deprecated Use `mplToolbox` instead. */
export const mplEssentials = mplToolbox;
