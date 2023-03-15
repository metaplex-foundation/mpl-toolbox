import {
  generateSigner,
  sol,
  subtractAmounts,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  createAssociatedToken,
  createToken,
  createTokenIfMissing,
  fetchToken,
  findAssociatedTokenPda,
  getTokenSize,
  TokenState,
  TokExCannotCreateNonAssociatedTokenError,
  TokExInvalidAssociatedTokenAccountError,
  TokExInvalidAssociatedTokenProgramError,
  TokExInvalidSystemProgramError,
  TokExInvalidTokenMintError,
  TokExInvalidTokenOwnerError,
  TokExInvalidTokenProgramError,
} from '../src';
import { createMint, createUmi } from './_setup';

test('it creates a new associated token if missing', async (t) => {
  // Given an existing mint and owner with no associated token account.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction.
  await createTokenIfMissing(umi, { mint, owner }).sendAndConfirm(umi);

  // Then a new associated token account was created.
  const ata = findAssociatedTokenPda(umi, { mint, owner });
  const ataAccount = await fetchToken(umi, ata);
  t.like(ataAccount, {
    publicKey: ata,
    mint,
    owner,
    state: TokenState.Initialized,
    amount: 0n,
  });
});

test('it defaults to the identity if no owner is provided', async (t) => {
  // Given an existing mint without an associated token account with the identity.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const identity = umi.identity.publicKey;

  // When we execute the "CreateTokenIfMissing" instruction without an owner.
  await createTokenIfMissing(umi, { mint }).sendAndConfirm(umi);

  // Then a new associated token account was created for the identity.
  const ata = findAssociatedTokenPda(umi, { mint, owner: identity });
  const ataAccount = await fetchToken(umi, ata);
  t.like(ataAccount, {
    publicKey: ata,
    mint,
    owner: identity,
    state: TokenState.Initialized,
    amount: 0n,
  });
});

test('the payer pays for the storage fees if a token account gets created', async (t) => {
  // Given an existing mint and a payer.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const payer = await generateSignerWithSol(umi, sol(100));
  const identity = umi.identity.publicKey;

  // When we execute the "CreateTokenIfMissing" instruction with an explicit payer.
  await createTokenIfMissing({ ...umi, payer }, { mint }).sendAndConfirm(umi);

  // Then the payer paid for the storage fee.
  const storageFee = await umi.rpc.getRent(getTokenSize());
  const payerBalance = await umi.rpc.getBalance(payer.publicKey);
  t.deepEqual(payerBalance, subtractAmounts(sol(100), storageFee));

  // And this matches the lamports on the ATA account.
  const ata = findAssociatedTokenPda(umi, { mint, owner: identity });
  const ataAccount = await fetchToken(umi, ata);
  t.deepEqual(ataAccount.header.lamports, storageFee);
});

test('it does not create an account if an associated token account already exists', async (t) => {
  // Given an existing mint, owner and associated token account.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;
  const ata = findAssociatedTokenPda(umi, { mint, owner });
  await createAssociatedToken(umi, { mint, owner }).sendAndConfirm(umi);
  t.true(await umi.rpc.accountExists(ata));

  // And given an explicit payer to ensure it was not charged for the storage fee.
  const payer = await generateSignerWithSol(umi, sol(100));

  // When we execute the "CreateTokenIfMissing" instruction on that mint/owner pair.
  await transactionBuilder()
    .add(createTokenIfMissing({ ...umi, payer }, { mint, owner }))
    .sendAndConfirm(umi);

  // Then the ata still exists.
  t.true(await umi.rpc.accountExists(ata));

  // And the payer was not charged for the storage fee of a new account as no new account was created.
  const payerBalance = await umi.rpc.getBalance(payer.publicKey);
  t.deepEqual(payerBalance, sol(100));
});

test('it does not create an account if a regular token account already exists', async (t) => {
  // Given an existing mint, owner and a regular token account between them.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;
  const token = generateSigner(umi);
  await createToken(umi, { mint, owner, token }).sendAndConfirm(umi);
  t.true(await umi.rpc.accountExists(token.publicKey));

  // And given an explicit payer to ensure it was not charged for the storage fee.
  const payer = await generateSignerWithSol(umi, sol(100));

  // When we execute the "CreateTokenIfMissing" instruction on that mint/owner pair
  // whilst explicitly providing the token account.
  await createTokenIfMissing(
    { ...umi, payer },
    { mint, owner, token: token.publicKey }
  ).sendAndConfirm(umi);

  // Then the token account still exists.
  t.true(await umi.rpc.accountExists(token.publicKey));

  // And the payer was not charged for the storage fee of a new account as no new account was created.
  const payerBalance = await umi.rpc.getBalance(payer.publicKey);
  t.deepEqual(payerBalance, sol(100));
});

test('it fail if we provide the wrong system program', async (t) => {
  // Given an existing mint and a wrong system program.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const systemProgram = generateSigner(umi).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction with the wrong system program.
  const promise = createTokenIfMissing(umi, {
    mint,
    systemProgram,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error.
  await t.throwsAsync(promise, { instanceOf: TokExInvalidSystemProgramError });
});

test('it fail if we provide the wrong token program', async (t) => {
  // Given an existing mint and a wrong token program.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const tokenProgram = generateSigner(umi).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction with the wrong token program.
  const promise = createTokenIfMissing(umi, {
    mint,
    tokenProgram,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error.
  await t.throwsAsync(promise, { instanceOf: TokExInvalidTokenProgramError });
});

test('it fail if we provide the wrong ata program', async (t) => {
  // Given an existing mint and a wrong ata program.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const ataProgram = generateSigner(umi).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction with the wrong ata program.
  const promise = createTokenIfMissing(umi, {
    mint,
    ataProgram,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error.
  await t.throwsAsync(promise, {
    instanceOf: TokExInvalidAssociatedTokenProgramError,
  });
});

test('it fail if the ata account does not match the mint and owner', async (t) => {
  // Given a mint, an owner and an invalid ata address.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;
  const invalidAta = generateSigner(umi).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction with the wrong ata address.
  const promise = createTokenIfMissing(umi, {
    mint,
    owner,
    ata: invalidAta,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error.
  await t.throwsAsync(promise, {
    instanceOf: TokExInvalidAssociatedTokenAccountError,
  });
});

test('it fail if the existing token account is not associated with the given mint', async (t) => {
  // Given a mint, an owner and a token account associated with the wrong mint.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const wrongMint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;
  const token = generateSigner(umi);
  await createToken(umi, { mint: wrongMint, owner, token }).sendAndConfirm(umi);

  // When we execute the "CreateTokenIfMissing" instruction on that token account.
  const promise = createTokenIfMissing(umi, {
    mint,
    owner,
    token: token.publicKey,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error.
  await t.throwsAsync(promise, { instanceOf: TokExInvalidTokenMintError });
});

test('it fail if the existing token account is not associated with the given owner', async (t) => {
  // Given a mint, an owner and a token account associated with the wrong owner.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;
  const wrongOwner = generateSigner(umi).publicKey;
  const token = generateSigner(umi);
  await createToken(umi, {
    mint,
    owner: wrongOwner,
    token,
  }).sendAndConfirm(umi);

  // When we execute the "CreateTokenIfMissing" instruction on that token account.
  const promise = createTokenIfMissing(umi, {
    mint,
    owner,
    token: token.publicKey,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error.
  await t.throwsAsync(promise, { instanceOf: TokExInvalidTokenOwnerError });
});

test('it fail if the non existing token account is not an ata account', async (t) => {
  // Given an existing mint/owner pair with no token account.
  const umi = await createUmi();
  const mint = (await createMint(umi)).publicKey;
  const owner = generateSigner(umi).publicKey;

  // And given a new address for a regular (non-associated) token account.
  const token = generateSigner(umi).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction on that token account.
  const promise = createTokenIfMissing(umi, {
    mint,
    owner,
    token,
  }).sendAndConfirm(umi);

  // Then we expect a custom program error because we need the token account
  // as a Signer in order to create it.
  await t.throwsAsync(promise, {
    instanceOf: TokExCannotCreateNonAssociatedTokenError,
  });
});
