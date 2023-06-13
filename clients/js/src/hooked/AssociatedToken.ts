import { Context, Pda, PublicKey } from '@metaplex-foundation/umi';

export function findAssociatedTokenPda(
  context: Pick<Context, 'serializer' | 'eddsa' | 'programs'>,
  seeds: {
    /** The address of the mint account */
    mint: PublicKey;
    /** The owner of the token account */
    owner: PublicKey;
  }
): Pda {
  const s = context.serializer;
  const associatedTokenProgramId =
    context.programs.getPublicKey('splAssociatedToken');
  const tokenProgramId = context.programs.getPublicKey('splToken');
  return context.eddsa.findPda(associatedTokenProgramId, [
    s.publicKey().serialize(seeds.owner),
    s.publicKey().serialize(tokenProgramId),
    s.publicKey().serialize(seeds.mint),
  ]);
}
