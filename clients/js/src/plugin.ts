import { UmiPlugin } from '@metaplex-foundation/umi';
import {
  createMplSystemExtrasProgram,
  createMplTokenExtrasProgram,
  createSplAddressLookupTableProgram,
  createSplAssociatedTokenProgram,
  createSplMemoProgram,
  createSplSystemProgram,
  createSplTokenProgram,
} from './generated';

export const mplEssentials = (): UmiPlugin => ({
  install(umi) {
    umi.programs.add(createSplSystemProgram(), false);
    umi.programs.add(createSplMemoProgram(), false);
    umi.programs.add(createSplTokenProgram(), false);
    umi.programs.add(createSplAssociatedTokenProgram(), false);
    umi.programs.add(createSplAddressLookupTableProgram(), false);
    umi.programs.add(createMplSystemExtrasProgram(), false);
    umi.programs.add(createMplTokenExtrasProgram(), false);
  },
});
