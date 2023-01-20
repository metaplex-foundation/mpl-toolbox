import {
  Context,
  getProgramAddressWithFallback,
  Pda,
  PublicKey,
} from '@lorisleiva/js-core';

export function findAssociatedTokenPda(
  context: {
    serializer: Context['serializer'];
    eddsa: Context['eddsa'];
    programs?: Context['programs'];
  },
  seeds: {
    /** The address of the mint account */
    mint: PublicKey;
    /** The owner of the token account */
    owner: PublicKey;
  }
): Pda {
  const s = context.serializer;
  const associatedTokenProgramId = getProgramAddressWithFallback(
    context,
    'splAssociatedTokenAccount',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
  );
  const tokenProgramId = getProgramAddressWithFallback(
    context,
    'splToken',
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  );
  return context.eddsa.findPda(associatedTokenProgramId, [
    s.publicKey.serialize(seeds.owner),
    tokenProgramId.bytes,
    s.publicKey.serialize(seeds.mint),
  ]);
}
