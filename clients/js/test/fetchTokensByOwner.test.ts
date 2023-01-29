import { generateSigner } from '@lorisleiva/js-core';
import test from 'ava';
import { fetchTokensByOwner } from '../src';
import { createMetaplex, createMintAndToken } from './_setup';

test('it fetches all token account owned by a given owner', async (t) => {
  // Given an existing owner.
  const mx = await createMetaplex();
  const owner = generateSigner(mx).publicKey;

  // And
  // const [mintA, tokenA] = await createMintAndToken(mx, { owner });
  await createMintAndToken(mx, { owner });

  // When
  const foo = await fetchTokensByOwner(mx, owner);
  console.log(foo);
  t.pass();
});
