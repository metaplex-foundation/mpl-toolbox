import { base58PublicKey, generateSigner } from '@lorisleiva/js-core';
import test from 'ava';
import { fetchTokensByOwner, fetchTokensByOwnerAndMint } from '../src';
import {
  createMetaplex,
  createMint,
  createMintAndToken,
  createToken,
} from './_setup';

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
    tokens.map((token) => base58PublicKey(token.publicKey)).sort(),
    [
      base58PublicKey(tokenA.publicKey),
      base58PublicKey(tokenB.publicKey),
    ].sort()
  );
});

test('it fetches all token account owned by a given mint/owner pair', async (t) => {
  // Given two owners A and B and two mints U and V.
  const mx = await createMetaplex();
  const ownerA = generateSigner(mx).publicKey;
  const ownerB = generateSigner(mx).publicKey;
  const mintU = (await createMint(mx)).publicKey;
  const mintV = (await createMint(mx)).publicKey;

  // And owner A owns two mint U accounts and one mint V account.
  const tokenAU1 = await createToken(mx, { mint: mintU, owner: ownerA });
  const tokenAU2 = await createToken(mx, { mint: mintU, owner: ownerA });
  await createToken(mx, { mint: mintV, owner: ownerA });

  // And owner A owns one mint U account and one mint V account.
  await createToken(mx, { mint: mintU, owner: ownerB });
  await createToken(mx, { mint: mintV, owner: ownerB });

  // When we fetch all mint U tokens owned by owner A.
  const tokens = await fetchTokensByOwnerAndMint(mx, ownerA, mintU);

  // Then we only get back the two tokens owned by owner A from mint U.
  t.is(tokens.length, 2);
  t.deepEqual(
    tokens.map((token) => base58PublicKey(token.publicKey)).sort(),
    [
      base58PublicKey(tokenAU1.publicKey),
      base58PublicKey(tokenAU2.publicKey),
    ].sort()
  );
});
