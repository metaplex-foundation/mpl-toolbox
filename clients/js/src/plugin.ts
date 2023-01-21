import { MetaplexPlugin } from '@lorisleiva/js-core';
import {
  getMplSystemExtrasProgram,
  getMplTokenExtrasProgram,
  getSplAssociatedTokenAccountProgram,
  getSplMemoProgram,
  getSplSystemProgram,
  getSplTokenProgram,
} from './generated';

export const mplEssentials = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.programs.add(getSplSystemProgram(), false);
    metaplex.programs.add(getSplMemoProgram(), false);
    metaplex.programs.add(getSplTokenProgram(), false);
    metaplex.programs.add(getSplAssociatedTokenAccountProgram(), false);
    metaplex.programs.add(getMplSystemExtrasProgram(), false);
    metaplex.programs.add(getMplTokenExtrasProgram(), false);
  },
});
