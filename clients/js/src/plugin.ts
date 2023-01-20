import {
  ClusterFilter,
  MetaplexPlugin,
  Program,
  ProgramRepositoryInterface,
} from '@lorisleiva/js-core';
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
    const splSystemProgram = getSplSystemProgram();
    metaplex.programs.add(splSystemProgram);
    metaplex.programs.getSystem = getShortcutMethod(splSystemProgram);

    const splMemoProgram = getSplMemoProgram();
    metaplex.programs.add(splMemoProgram);
    metaplex.programs.getMemo = getShortcutMethod(splMemoProgram);

    const splTokenProgram = getSplTokenProgram();
    metaplex.programs.add(splTokenProgram);
    metaplex.programs.getToken = getShortcutMethod(splTokenProgram);

    const splAssociatedTokenProgram = getSplAssociatedTokenAccountProgram();
    metaplex.programs.add(splAssociatedTokenProgram);
    metaplex.programs.getAssociatedToken = getShortcutMethod(
      splAssociatedTokenProgram
    );

    const mplSystemExtras = getMplSystemExtrasProgram();
    metaplex.programs.add(mplSystemExtras);
    metaplex.programs.getSystemExtras = getShortcutMethod(mplSystemExtras);

    const mplTokenExtras = getMplTokenExtrasProgram();
    metaplex.programs.add(mplTokenExtras);
    metaplex.programs.getSystemExtras = getShortcutMethod(mplTokenExtras);
  },
});

function getShortcutMethod(program: Program) {
  return function (
    this: ProgramRepositoryInterface,
    clusterFilter?: ClusterFilter
  ) {
    return this.get(program.name, clusterFilter);
  };
}

declare module '@lorisleiva/js-core' {
  interface ProgramRepositoryInterface {
    getAssociatedToken(clusterFilter?: ClusterFilter): Program;
    getMemo(clusterFilter?: ClusterFilter): Program;
    getSystem(clusterFilter?: ClusterFilter): Program;
    getSystemExtras(clusterFilter?: ClusterFilter): Program;
    getToken(clusterFilter?: ClusterFilter): Program;
    getTokenExtras(clusterFilter?: ClusterFilter): Program;
  }
}
