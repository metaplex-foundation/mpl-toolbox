import { generateSigner } from '@lorisleiva/js-test';
import test from 'ava';
import { deserializeToken, getTokenGpaBuilder } from '../src';
import { createMetaplex, createMint, createToken } from './_setup';

test('it can fetch token accounts by owner', async (t) => {
  // Given two token accounts A and B owned by owners A and B respectively.
  const mx = await createMetaplex();
  const ownerA = generateSigner(mx).publicKey;
  const ownerB = generateSigner(mx).publicKey;
  const mint = (await createMint(mx)).publicKey;
  const tokenA = await createToken(mx, { mint, owner: ownerA });
  await createToken(mx, { mint, owner: ownerB });

  // When we fetch all token accounts owned by owner A.
  const tokens = await getTokenGpaBuilder(mx)
    .whereField('owner', ownerA)
    .getAndMap((account) => deserializeToken(mx, account));

  // Then we got the token A only.
  t.deepEqual(tokens[0].publicKey, tokenA.publicKey);
});
