import { Context, Pda, PublicKey } from '@metaplex-foundation/umi';
import { publicKey } from '@metaplex-foundation/umi/serializers';

export function findAssociatedTokenPda(
  context: Pick<Context, 'eddsa' | 'programs'>,
  seeds: {
    /** The address of the mint account */
    mint: PublicKey;
    /** The owner of the token account */
    owner: PublicKey;
    /** The Token or Token2022 Program id */
    tokenProgramId?: PublicKey;
  }
): Pda {
  const associatedTokenProgramId =
    context.programs.getPublicKey('splAssociatedToken');
  const tokenProgramIdResolved =
    seeds.tokenProgramId ?? context.programs.getPublicKey('splToken');
  return context.eddsa.findPda(associatedTokenProgramId, [
    publicKey().serialize(seeds.owner),
    publicKey().serialize(tokenProgramIdResolved),
    publicKey().serialize(seeds.mint),
  ]);
}
