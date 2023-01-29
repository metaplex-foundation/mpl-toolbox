import { generateSigner } from '@lorisleiva/js-core';
import test from 'ava';
import { fetchTokensByOwner } from '../src';
import { createMetaplex } from './_setup';

test.skip('it fetches all token account owned by a given owner', async (t) => {
  // Given an existing owner.
  const mx = await createMetaplex();
  const owner = generateSigner(mx);

  // When
  const foo = await fetchTokensByOwner(mx, owner.publicKey);
});
