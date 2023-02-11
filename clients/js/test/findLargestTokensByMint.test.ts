import { tokenAmount } from '@metaplex-foundation/umi-core';
import test from 'ava';
import { findLargestTokensByMint } from '../src';
import { createMetaplex, createMint, createToken } from './_setup';

test('it gets all token accounts ordered by descending amounts', async (t) => {
  // Given an existing mint.
  const mx = await createMetaplex();
  const mint = await createMint(mx);

  // And a token account A with 1 token.
  const tokenA = await createToken(mx, { mint: mint.publicKey, amount: 1 });

  // And a token account B with 10 tokens.
  const tokenB = await createToken(mx, { mint: mint.publicKey, amount: 10 });

  // When we find the largest tokens for the mint.
  const tokens = await findLargestTokensByMint(mx, mint.publicKey);

  // Then we receive a list of token addresses with their amounts
  // such that token B is first and token A is second.
  t.deepEqual(tokens, [
    { publicKey: tokenB.publicKey, amount: tokenAmount(10) },
    { publicKey: tokenA.publicKey, amount: tokenAmount(1) },
  ]);
});
