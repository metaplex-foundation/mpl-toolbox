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
import { createToken2022Program } from './generated-token2022';

export const mplToolbox = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createSplSystemProgram(), false);
    umi.programs.add(createSplMemoProgram(), false);
    umi.programs.add(createSplTokenProgram(), false);
    umi.programs.add(createSplAssociatedTokenProgram(), false);
    umi.programs.add(createSplAddressLookupTableProgram(), false);
    umi.programs.add(createMplSystemExtrasProgram(), false);
    umi.programs.add(createMplTokenExtrasProgram(), false);

    // Token-2022 (Token Extensions), generated from its own IDL and exposed
    // under the `token2022` namespace. Registered under the program name
    // `token2022` used by the generated Token-2022 instructions.
    umi.programs.add(createToken2022Program(), false);

    // Deprecated: a stub `splToken2022` (the SPL Token program relabelled),
    // kept for backwards compatibility with earlier releases. Prefer the real
    // `token2022` program registered above.
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
