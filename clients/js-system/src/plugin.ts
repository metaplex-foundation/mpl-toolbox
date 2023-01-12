import { MetaplexPlugin } from '@lorisleiva/js-core';
import { getSplSystemProgram } from './generated';

export const splSystem = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.programs.add(getSplSystemProgram(metaplex));
  },
});
