import { ClusterFilter, MetaplexPlugin, Program } from '@lorisleiva/js-core';
import { getSplMemoProgram, getSplSystemProgram } from './generated';

export const splSystem = (): MetaplexPlugin => ({
  install(metaplex) {
    const splSystem = getSplSystemProgram(metaplex);
    metaplex.programs.add(splSystem);
    metaplex.programs.getSystem = function (clusterFilter?: ClusterFilter) {
      return this.get(splSystem.name, clusterFilter);
    };

    const splMemo = getSplMemoProgram(metaplex);
    metaplex.programs.add(splMemo);
    metaplex.programs.getMemo = function (clusterFilter?: ClusterFilter) {
      return this.get(splMemo.name, clusterFilter);
    };
  },
});

declare module '@lorisleiva/js-core' {
  interface ProgramRepositoryInterface {
    getSystem(clusterFilter?: ClusterFilter): Program;
    getMemo(clusterFilter?: ClusterFilter): Program;
  }
}
