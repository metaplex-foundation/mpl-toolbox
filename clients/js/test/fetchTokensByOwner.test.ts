import { generateSigner } from '@lorisleiva/js-core';
import test from 'ava';
import { fetchTokensByOwner } from '../src';
import { createMetaplex, createMintAndToken } from './_setup';

test('it fetches all token account owned by a given owner', async (t) => {
  // Given an existing owner A.
  const mx = await createMetaplex();
  const ownerA = generateSigner(mx).publicKey;

  // And two tokens owned by owner A.
  const [, tokenA] = await createMintAndToken(mx, { owner: ownerA });
  const [, tokenB] = await createMintAndToken(mx, { owner: ownerA });

  // And a token owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB });

  // When we fetch all tokens owned by owner A.
  const tokens = await fetchTokensByOwner(mx, ownerA);

  // Then we only get back the two tokens owned by owner A.
  t.is(tokens.length, 2);
  t.deepEqual(
    tokens.map((token) => token.publicKey),
    [tokenA.publicKey, tokenB.publicKey]
  );
});
