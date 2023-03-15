import { generateSigner, transactionBuilder } from '@metaplex-foundation/umi';
import test from 'ava';
import { createMint, createToken, fetchToken, mintTokensTo } from '../src';
import { createUmi } from './_setup';

test('it can mint tokens to an existing token account', async (t) => {
  // Given an empty token account.
  const umi = await createUmi();
  const mintAuthority = generateSigner(umi);
  const mint = generateSigner(umi);
  const token = generateSigner(umi);
  await transactionBuilder()
    .add(createMint(umi, { mint, mintAuthority: mintAuthority.publicKey }))
    .add(createToken(umi, { token, mint: mint.publicKey }))
    .sendAndConfirm(umi);
  t.is((await fetchToken(umi, token.publicKey)).amount, 0n);

  // When we mint tokens to the account.
  await transactionBuilder()
    .add(
      mintTokensTo(umi, {
        mintAuthority,
        mint: mint.publicKey,
        token: token.publicKey,
        amount: 42,
      })
    )
    .sendAndConfirm(umi);

  // Then the account has the correct amount of tokens.
  t.is((await fetchToken(umi, token.publicKey)).amount, 42n);
});
