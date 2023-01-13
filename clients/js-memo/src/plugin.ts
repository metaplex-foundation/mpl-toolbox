import { ClusterFilter, MetaplexPlugin, Program } from '@lorisleiva/js-core';
import { getSplMemoProgram } from './generated';

export const splMemo = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.programs.add(getSplMemoProgram(metaplex));
    metaplex.programs.getMemo = function (clusterFilter?: ClusterFilter) {
      return this.get('splMemo', clusterFilter);
    };
  },
});

declare module '@lorisleiva/js-core' {
  interface ProgramRepositoryInterface {
    getMemo(clusterFilter?: ClusterFilter): Program;
  }
}
