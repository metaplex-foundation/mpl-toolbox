import { ClusterFilter, MetaplexPlugin, Program } from '@lorisleiva/js-core';
import { getSplSystemProgram } from './generated';

export const splSystem = (): MetaplexPlugin => ({
  install(metaplex) {
    metaplex.programs.add(getSplSystemProgram(metaplex));
    metaplex.programs.getSystem = function (clusterFilter?: ClusterFilter) {
      return this.get('splSystem', clusterFilter);
    };
  },
});

declare module '@lorisleiva/js-core' {
  interface ProgramRepositoryInterface {
    getSystem(clusterFilter?: ClusterFilter): Program;
  }
}
