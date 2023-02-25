import {
  generateSigner,
  transactionBuilder,
} from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  createAssociatedToken,
  createLutForTransactionBuilder,
  createMint,
} from '../src';
import { createUmi } from './_setup';

test('dummy', async (t) => {
  // Given
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  const mint = generateSigner(umi);
  const owner = generateSigner(umi).publicKey;
  const builder = transactionBuilder(umi)
    .add(createMint(umi, { mint }))
    .add(createAssociatedToken(umi, { mint: mint.publicKey, owner }));

  const result = createLutForTransactionBuilder(umi, builder, recentSlot);
  console.log({ result });

  t.pass();
});
