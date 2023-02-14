import { generateSigner } from '@metaplex-foundation/umi-test';
import test from 'ava';
import { getTokenGpaBuilder } from '../src';
import { createUmi, createMint, createToken } from './_setup';

test('it can fetch token accounts by owner', async (t) => {
  // Given two token accounts A and B owned by owners A and B respectively.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;
  const ownerB = generateSigner(mx).publicKey;
  const mint = (await createMint(mx)).publicKey;
  const tokenA = await createToken(mx, { mint, owner: ownerA });
  await createToken(mx, { mint, owner: ownerB });

  // When we fetch all token accounts owned by owner A.
  const tokens = await getTokenGpaBuilder(mx)
    .whereField('owner', ownerA)
    .getDeserialized();

  // Then we got the token A only.
  t.deepEqual(tokens[0].publicKey, tokenA.publicKey);
});
