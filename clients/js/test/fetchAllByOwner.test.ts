import { base58PublicKey, generateSigner } from '@metaplex-foundation/umi';
import test from 'ava';
import {
  fetchAllMintByOwner,
  fetchAllMintPublicKeyByOwner,
  fetchAllTokenByOwner,
  fetchAllTokenByOwnerAndMint,
} from '../src';
import {
  createUmi,
  createMint,
  createMintAndToken,
  createToken,
} from './_setup';

test('it can fetch all token account owned by a given owner', async (t) => {
  // Given an existing owner A.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;

  // And two tokens owned by owner A.
  const [, tokenA] = await createMintAndToken(mx, { owner: ownerA, amount: 1 });
  const [, tokenB] = await createMintAndToken(mx, { owner: ownerA, amount: 6 });

  // And a token owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB, amount: 1 });

  // When we fetch all tokens owned by owner A.
  const tokens = await fetchAllTokenByOwner(mx, ownerA);

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

test('it can fetch all token account owned by a given mint/owner pair', async (t) => {
  // Given two owners A and B and two mints U and V.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;
  const ownerB = generateSigner(mx).publicKey;
  const mintU = (await createMint(mx)).publicKey;
  const mintV = (await createMint(mx)).publicKey;

  // And owner A owns two mint U accounts and one mint V account.
  const tokenAU1 = await createToken(mx, {
    mint: mintU,
    owner: ownerA,
    amount: 1,
  });
  const tokenAU2 = await createToken(mx, {
    mint: mintU,
    owner: ownerA,
    amount: 6,
  });
  await createToken(mx, { mint: mintV, owner: ownerA, amount: 1 });

  // And owner A owns one mint U account and one mint V account.
  await createToken(mx, { mint: mintU, owner: ownerB, amount: 1 });
  await createToken(mx, { mint: mintV, owner: ownerB, amount: 1 });

  // When we fetch all mint U tokens owned by owner A.
  const tokens = await fetchAllTokenByOwnerAndMint(mx, ownerA, mintU);

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

test('it can fetch all token account using a getProgramAccount strategy', async (t) => {
  // Given an existing owner A.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;

  // And two tokens owned by owner A.
  const [, tokenA] = await createMintAndToken(mx, { owner: ownerA, amount: 1 });
  const [, tokenB] = await createMintAndToken(mx, { owner: ownerA, amount: 6 });

  // And a token owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB, amount: 1 });

  // When we fetch all tokens owned by owner A using the getProgramAccounts strategy.
  const tokens = await fetchAllTokenByOwner(mx, ownerA, {
    tokenStrategy: 'getProgramAccounts',
  });

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

test('it can fetch all token account using custom amount filters', async (t) => {
  // Given an existing owner with 3 mint/token pairs with 0, 1, and 2 tokens.
  const mx = await createUmi();
  const owner = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner, amount: 0 });
  await createMintAndToken(mx, { owner, amount: 1 });
  await createMintAndToken(mx, { owner, amount: 2 });

  // When we fetch all tokens using the default filter.
  let tokens = await fetchAllTokenByOwner(mx, owner);

  // Then we get all tokens with an amount greater than 0.
  t.is(tokens.length, 2);
  t.true(tokens.every((token) => token.amount > 0));

  // When we fetch tokens with an amount equal to 1.
  tokens = await fetchAllTokenByOwner(mx, owner, {
    tokenAmountFilter: (amount) => amount === 1n,
  });

  // Then we get only the token with an amount equal to 1.
  t.is(tokens.length, 1);
  t.true(tokens.every((token) => token.amount === 1n));

  // When we fetch tokens with an amount lower than 2.
  tokens = await fetchAllTokenByOwner(mx, owner, {
    tokenAmountFilter: (amount) => amount < 2,
  });

  // Then we get all tokens with an amount lower than 2.
  t.is(tokens.length, 2);
  t.true(tokens.every((token) => token.amount < 2));
});

test('it can fetch all mint public keys owned by a given owner', async (t) => {
  // Given an existing owner A.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;

  // And two mints owned by owner A.
  const [mintA] = await createMintAndToken(mx, { owner: ownerA, amount: 1 });
  const [mintB] = await createMintAndToken(mx, { owner: ownerA, amount: 6 });

  // And a mint owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB, amount: 1 });

  // When we fetch all mint public keys owned by owner A.
  const mints = await fetchAllMintPublicKeyByOwner(mx, ownerA);

  // Then we only get back the two mints owned by owner A.
  t.is(mints.length, 2);
  t.deepEqual(
    mints.map(base58PublicKey).sort(),
    [base58PublicKey(mintA.publicKey), base58PublicKey(mintB.publicKey)].sort()
  );
});

test('it can fetch all mint public keys using a getProgramAccount strategy', async (t) => {
  // Given an existing owner A.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;

  // And two mints owned by owner A.
  const [mintA] = await createMintAndToken(mx, { owner: ownerA, amount: 1 });
  const [mintB] = await createMintAndToken(mx, { owner: ownerA, amount: 6 });

  // And a mint owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB, amount: 1 });

  // When we fetch all mint public keys owned by owner A using the getProgramAccounts strategy.
  const mints = await fetchAllMintPublicKeyByOwner(mx, ownerA, {
    tokenStrategy: 'getProgramAccounts',
  });

  // Then we only get back the two mints owned by owner A.
  t.is(mints.length, 2);
  t.deepEqual(
    mints.map(base58PublicKey).sort(),
    [base58PublicKey(mintA.publicKey), base58PublicKey(mintB.publicKey)].sort()
  );
});

test('it can fetch all mint public keys using custom amount filters', async (t) => {
  // Given an existing owner with 3 mint/token pairs with 0, 1, and 2 tokens.
  const mx = await createUmi();
  const owner = generateSigner(mx).publicKey;
  const [mintSignerA] = await createMintAndToken(mx, { owner, amount: 0 });
  const [mintSignerB] = await createMintAndToken(mx, { owner, amount: 1 });
  const [mintSignerC] = await createMintAndToken(mx, { owner, amount: 2 });
  const mintA = base58PublicKey(mintSignerA.publicKey);
  const mintB = base58PublicKey(mintSignerB.publicKey);
  const mintC = base58PublicKey(mintSignerC.publicKey);

  // When we fetch all mints using the default filter.
  let mints = await fetchAllMintPublicKeyByOwner(mx, owner);

  // Then we get all mints with a token amount greater than 0.
  t.is(mints.length, 2);
  t.deepEqual(mints.map(base58PublicKey).sort(), [mintB, mintC].sort());

  // When we fetch mints with a token amount equal to 1.
  mints = await fetchAllMintPublicKeyByOwner(mx, owner, {
    tokenAmountFilter: (amount) => amount === 1n,
  });

  // Then we get only the mint with a token amount equal to 1.
  t.is(mints.length, 1);
  t.deepEqual(mints.map(base58PublicKey).sort(), [mintB].sort());

  // When we fetch mints with a token amount lower than 2.
  mints = await fetchAllMintPublicKeyByOwner(mx, owner, {
    tokenAmountFilter: (amount) => amount < 2,
  });

  // Then we get all mints with a token amount lower than 2.
  t.is(mints.length, 2);
  t.deepEqual(mints.map(base58PublicKey).sort(), [mintA, mintB].sort());
});

test('it can fetch all mint accounts owned by a given owner', async (t) => {
  // Given an existing owner A.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;

  // And two mints owned by owner A.
  const [mintA] = await createMintAndToken(mx, { owner: ownerA, amount: 1 });
  const [mintB] = await createMintAndToken(mx, { owner: ownerA, amount: 6 });

  // And a mint owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB, amount: 1 });

  // When we fetch all mint accounts owned by owner A.
  const mints = await fetchAllMintByOwner(mx, ownerA);

  // Then we only get back the two mints owned by owner A.
  t.is(mints.length, 2);
  t.deepEqual(
    mints.map(base58PublicKey).sort(),
    [base58PublicKey(mintA.publicKey), base58PublicKey(mintB.publicKey)].sort()
  );
});

test('it can fetch all mint accounts using a getProgramAccount strategy', async (t) => {
  // Given an existing owner A.
  const mx = await createUmi();
  const ownerA = generateSigner(mx).publicKey;

  // And two mints owned by owner A.
  const [mintA] = await createMintAndToken(mx, { owner: ownerA, amount: 1 });
  const [mintB] = await createMintAndToken(mx, { owner: ownerA, amount: 6 });

  // And a mint owned by another owner B.
  const ownerB = generateSigner(mx).publicKey;
  await createMintAndToken(mx, { owner: ownerB, amount: 1 });

  // When we fetch all mint accounts owned by owner A using the getProgramAccounts strategy.
  const mints = await fetchAllMintByOwner(mx, ownerA, {
    tokenStrategy: 'getProgramAccounts',
  });

  // Then we only get back the two mints owned by owner A.
  t.is(mints.length, 2);
  t.deepEqual(
    mints.map(base58PublicKey).sort(),
    [base58PublicKey(mintA.publicKey), base58PublicKey(mintB.publicKey)].sort()
  );
});

test('it can fetch all mint accounts using custom amount filters', async (t) => {
  // Given an existing owner with 3 mint/token pairs with 0, 1, and 2 tokens.
  const mx = await createUmi();
  const owner = generateSigner(mx).publicKey;
  const [mintSignerA] = await createMintAndToken(mx, { owner, amount: 0 });
  const [mintSignerB] = await createMintAndToken(mx, { owner, amount: 1 });
  const [mintSignerC] = await createMintAndToken(mx, { owner, amount: 2 });
  const mintA = base58PublicKey(mintSignerA.publicKey);
  const mintB = base58PublicKey(mintSignerB.publicKey);
  const mintC = base58PublicKey(mintSignerC.publicKey);

  // When we fetch all mints using the default filter.
  let mints = await fetchAllMintByOwner(mx, owner);

  // Then we get all mints with a token amount greater than 0.
  t.is(mints.length, 2);
  t.deepEqual(mints.map(base58PublicKey).sort(), [mintB, mintC].sort());

  // When we fetch mints with a token amount equal to 1.
  mints = await fetchAllMintByOwner(mx, owner, {
    tokenAmountFilter: (amount) => amount === 1n,
  });

  // Then we get only the mint with a token amount equal to 1.
  t.is(mints.length, 1);
  t.deepEqual(mints.map(base58PublicKey).sort(), [mintB].sort());

  // When we fetch mints with a token amount lower than 2.
  mints = await fetchAllMintByOwner(mx, owner, {
    tokenAmountFilter: (amount) => amount < 2,
  });

  // Then we get all mints with a token amount lower than 2.
  t.is(mints.length, 2);
  t.deepEqual(mints.map(base58PublicKey).sort(), [mintA, mintB].sort());
});
