import { ClusterFilter, MetaplexPlugin, Program } from '@lorisleiva/js-core';
import { getSplMemoProgram, getSplSystemProgram } from './generated';

export const splSystem = (): MetaplexPlugin => ({
  install(metaplex) {
    const splSystemProgram = getSplSystemProgram(metaplex);
    metaplex.programs.add(splSystemProgram);
    metaplex.programs.getSystem = function (clusterFilter?: ClusterFilter) {
      return this.get(splSystemProgram.name, clusterFilter);
    };

    const splMemoProgram = getSplMemoProgram(metaplex);
    metaplex.programs.add(splMemoProgram);
    metaplex.programs.getMemo = function (clusterFilter?: ClusterFilter) {
      return this.get(splMemoProgram.name, clusterFilter);
    };
  },
});

declare module '@lorisleiva/js-core' {
  interface ProgramRepositoryInterface {
    getSystem(clusterFilter?: ClusterFilter): Program;
    getMemo(clusterFilter?: ClusterFilter): Program;
  }
}
