import { Context, Pda, PublicKey } from '@lorisleiva/js-core';

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
  const associatedTokenProgramId = context.programs.get(
    'splAssociatedTokenAccount'
  ).address;
  const tokenProgramId = context.programs.get('splToken').address;
  return context.eddsa.findPda(associatedTokenProgramId, [
    s.publicKey.serialize(seeds.owner),
    tokenProgramId.bytes,
    s.publicKey.serialize(seeds.mint),
  ]);
}
