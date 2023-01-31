import { defaultPublicKey } from '@lorisleiva/js-test';
import test from 'ava';
import { deserializeMint, getMintGpaBuilder } from '../src';
import { createMetaplex, createMint } from './_setup';

test('it TODO', async (t) => {
  // Given
  const mx = await createMetaplex();
  await createMint(mx);

  // When
  const mints = await getMintGpaBuilder(mx, defaultPublicKey()).getAndMap(
    (account) => deserializeMint(mx, account)
  );
  console.log(mints);

  // Then
  t.pass();
});
