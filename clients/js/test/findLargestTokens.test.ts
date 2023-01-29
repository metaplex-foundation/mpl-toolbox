import {
  generateSigner,
  tokenAmount,
  transactionBuilder,
} from '@lorisleiva/js-core';
import test from 'ava';
import { createToken, findLargestTokens, mintTokensTo } from '../src';
import { createMetaplex, createMint } from './_setup';

test('it gets all token accounts ordered by descending amounts', async (t) => {
  // Given an existing mint.
  const mx = await createMetaplex();
  const mint = await createMint(mx);

  // And a token account A with 1 token.
  const tokenA = generateSigner(mx);
  await transactionBuilder(mx)
    .add(createToken(mx, { mint: mint.publicKey, token: tokenA }))
    .add(
      mintTokensTo(mx, {
        mint: mint.publicKey,
        token: tokenA.publicKey,
        amount: 1,
      })
    )
    .sendAndConfirm();

  // And a token account B with 10 tokens.
  const tokenB = generateSigner(mx);
  await transactionBuilder(mx)
    .add(createToken(mx, { mint: mint.publicKey, token: tokenB }))
    .add(
      mintTokensTo(mx, {
        mint: mint.publicKey,
        token: tokenB.publicKey,
        amount: 10,
      })
    )
    .sendAndConfirm();

  // When we find the largest tokens for the mint.
  const tokens = await findLargestTokens(mx, mint.publicKey);

  // Then we receive a list of token addresses with their amounts
  // such that token B is first and token A is second.
  t.deepEqual(tokens, [
    { publicKey: tokenB.publicKey, amount: tokenAmount(10) },
    { publicKey: tokenA.publicKey, amount: tokenAmount(1) },
  ]);
});
