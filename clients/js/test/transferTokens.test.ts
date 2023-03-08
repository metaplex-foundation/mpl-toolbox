import { generateSigner, transactionBuilder } from '@metaplex-foundation/umi';
import test from 'ava';
import { createToken, fetchToken, mintTokensTo, transferTokens } from '../src';
import { createUmi, createMint } from './_setup';

test('it can transfer tokens from one account to another', async (t) => {
  // Given an existing mint.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;

  // And a token account A from owner A with 50 tokens.
  const ownerA = generateSigner(umi);
  const ownerAPublicKey = ownerA.publicKey;
  const tokenA = generateSigner(umi);
  await transactionBuilder(umi)
    .add(createToken(umi, { mint, token: tokenA, owner: ownerAPublicKey }))
    .add(mintTokensTo(umi, { mint, token: tokenA.publicKey, amount: 50 }))
    .sendAndConfirm();

  // And a token account B from owner B with 10 tokens.
  const ownerB = generateSigner(umi).publicKey;
  const tokenB = generateSigner(umi);
  await transactionBuilder(umi)
    .add(createToken(umi, { mint, token: tokenB, owner: ownerB }))
    .add(mintTokensTo(umi, { mint, token: tokenB.publicKey, amount: 10 }))
    .sendAndConfirm();

  // When owner A transfers 30 tokens to owner B.
  await transactionBuilder(umi)
    .add(
      transferTokens(umi, {
        source: tokenA.publicKey,
        destination: tokenB.publicKey,
        authority: ownerA,
        amount: 30,
      })
    )
    .sendAndConfirm();

  // Then token account A now has 20 tokens.
  t.is((await fetchToken(umi, tokenA.publicKey)).amount, 20n);

  // And token account B now has 40 tokens.
  t.is((await fetchToken(umi, tokenB.publicKey)).amount, 40n);
});
