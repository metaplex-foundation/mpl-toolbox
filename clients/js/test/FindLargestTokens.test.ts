import { generateSigner, transactionBuilder } from '@lorisleiva/js-core';
import test from 'ava';
import { createToken, findLargestTokens, mintTokensTo } from '../src';
import { createMetaplex, createMint } from './_setup';

test('it gets all token accounts ordered by descending amounts', async (t) => {
  // Given
  const mx = await createMetaplex();
  const mint = await createMint(mx);

  // And
  const tokenA = generateSigner(mx);
  await transactionBuilder(mx)
    .add(createToken(mx, { mint: mint.publicKey, token: tokenA }))
    .add(
      mintTokensTo(mx, {
        mint: mint.publicKey,
        token: tokenA.publicKey,
        amount: 10,
      })
    )
    .sendAndConfirm();

  // And
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

  // When
  const foo = await findLargestTokens(mx, mint.publicKey);
  console.log(foo);

  // Then
  t.pass();
});
