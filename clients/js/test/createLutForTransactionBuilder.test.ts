import {
  base58PublicKey,
  generateSigner,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  createAssociatedToken,
  createLutForTransactionBuilder,
  createMint,
  findAssociatedTokenPda,
} from '../src';
import { createUmi } from './_setup';

test('dummy', async (t) => {
  // Given
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;
  console.log({
    identity: base58PublicKey(umi.identity),
    mint: base58PublicKey(mint),
    owner: base58PublicKey(owner),
    ata: base58PublicKey(
      findAssociatedTokenPda(umi, { mint: mint.publicKey, owner })
    ),
  });

  const builder = transactionBuilder(umi)
    .add(createMint(umi, { mint }))
    .add(createAssociatedToken(umi, { mint: mint.publicKey, owner }));

  const result = createLutForTransactionBuilder(umi, builder, recentSlot);
  console.log({ result });

  t.pass();
});
