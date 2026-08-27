import { generateSigner, publicKey } from '@metaplex-foundation/umi';
import { generateSignerWithSol } from '@metaplex-foundation/umi-bundle-tests';
import test from 'ava';
import {
  closeToken,
  createAssociatedToken,
  createIdempotentAssociatedToken,
  createMint,
  createMintWithAssociatedToken,
  createToken,
  fetchMint,
  fetchToken,
  findAssociatedTokenPda,
  mintTokensTo,
  transferTokens,
} from '../src';
import { createUmi } from './_setup';

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

test('mintTokensTo targets the SPL Token program by default', async (t) => {
  const umi = await createUmi();
  const builder = mintTokensTo(umi, {
    mint: generateSigner(umi).publicKey,
    token: generateSigner(umi).publicKey,
    amount: 1,
  });
  t.is(builder.items[0].instruction.programId, publicKey(SPL_TOKEN_PROGRAM_ID));
});

test('mintTokensTo targets Token-2022 when a tokenProgram is provided', async (t) => {
  const umi = await createUmi();
  const builder = mintTokensTo(umi, {
    mint: generateSigner(umi).publicKey,
    token: generateSigner(umi).publicKey,
    amount: 1,
    tokenProgram: publicKey(TOKEN_2022_PROGRAM_ID),
  });
  t.is(
    builder.items[0].instruction.programId,
    publicKey(TOKEN_2022_PROGRAM_ID)
  );
});

test('it can create a Token-2022 mint and mint to a Token-2022 token account', async (t) => {
  const umi = await createUmi();
  const tokenProgram = umi.programs.getPublicKey('splToken2022');
  const mintAuthority = generateSigner(umi);
  const mint = generateSigner(umi);
  const token = generateSigner(umi);

  await createMint(umi, {
    mint,
    mintAuthority: mintAuthority.publicKey,
    tokenProgram,
  }).sendAndConfirm(umi);
  await createToken(umi, {
    token,
    mint: mint.publicKey,
    tokenProgram,
  }).sendAndConfirm(umi);
  await mintTokensTo(umi, {
    mintAuthority,
    mint: mint.publicKey,
    token: token.publicKey,
    amount: 42,
    tokenProgram,
  }).sendAndConfirm(umi);

  // The mint and token accounts are owned by the Token-2022 program.
  const rawMint = await umi.rpc.getAccount(mint.publicKey);
  const rawToken = await umi.rpc.getAccount(token.publicKey);
  t.is(rawMint.exists && publicKey(rawMint.owner), tokenProgram);
  t.is(rawToken.exists && publicKey(rawToken.owner), tokenProgram);

  // And the data deserializes as expected.
  t.is((await fetchMint(umi, mint.publicKey)).decimals, 0);
  t.is((await fetchToken(umi, token.publicKey)).amount, 42n);
});

test('it can transfer Token-2022 tokens between two token accounts', async (t) => {
  const umi = await createUmi();
  const tokenProgram = umi.programs.getPublicKey('splToken2022');
  const mintAuthority = generateSigner(umi);
  const mint = generateSigner(umi);
  const source = generateSigner(umi);
  const destination = generateSigner(umi);

  await createMint(umi, {
    mint,
    mintAuthority: mintAuthority.publicKey,
    tokenProgram,
  }).sendAndConfirm(umi);
  await createToken(umi, { token: source, mint: mint.publicKey, tokenProgram })
    .add(
      createToken(umi, {
        token: destination,
        mint: mint.publicKey,
        tokenProgram,
      })
    )
    .sendAndConfirm(umi);
  await mintTokensTo(umi, {
    mintAuthority,
    mint: mint.publicKey,
    token: source.publicKey,
    amount: 100,
    tokenProgram,
  }).sendAndConfirm(umi);

  await transferTokens(umi, {
    source: source.publicKey,
    destination: destination.publicKey,
    authority: umi.identity,
    amount: 30,
    tokenProgram,
  }).sendAndConfirm(umi);

  t.is((await fetchToken(umi, source.publicKey)).amount, 70n);
  t.is((await fetchToken(umi, destination.publicKey)).amount, 30n);
});

test('it can close an empty Token-2022 token account', async (t) => {
  const umi = await createUmi();
  const tokenProgram = umi.programs.getPublicKey('splToken2022');
  const destination = await generateSignerWithSol(umi);
  const mint = generateSigner(umi);
  const token = generateSigner(umi);

  await createMint(umi, { mint, tokenProgram }).sendAndConfirm(umi);
  await createToken(umi, {
    token,
    mint: mint.publicKey,
    tokenProgram,
  }).sendAndConfirm(umi);

  await closeToken(umi, {
    account: token.publicKey,
    destination: destination.publicKey,
    owner: umi.identity,
    tokenProgram,
  }).sendAndConfirm(umi);

  t.false((await umi.rpc.getAccount(token.publicKey)).exists);
});

test('createMintWithAssociatedToken works under Token-2022', async (t) => {
  const umi = await createUmi();
  const tokenProgram = umi.programs.getPublicKey('splToken2022');
  const mint = generateSigner(umi);

  await createMintWithAssociatedToken(umi, {
    mint,
    amount: 42,
    tokenProgram,
  }).sendAndConfirm(umi);

  const [ata] = findAssociatedTokenPda(umi, {
    mint: mint.publicKey,
    owner: umi.identity.publicKey,
    tokenProgramId: tokenProgram,
  });
  const rawAta = await umi.rpc.getAccount(ata);
  t.is(rawAta.exists && publicKey(rawAta.owner), tokenProgram);
  t.is((await fetchToken(umi, ata)).amount, 42n);
});

test('createAssociatedToken and createIdempotentAssociatedToken work under Token-2022', async (t) => {
  const umi = await createUmi();
  const tokenProgram = umi.programs.getPublicKey('splToken2022');
  const owner = umi.identity.publicKey;
  const mint = generateSigner(umi);
  await createMint(umi, { mint, tokenProgram }).sendAndConfirm(umi);

  // createAssociatedToken derives the ATA (with the given tokenProgram) itself.
  await createAssociatedToken(umi, {
    mint: mint.publicKey,
    tokenProgram,
  }).sendAndConfirm(umi);

  // The idempotent variant requires an explicit ata/owner; passing the
  // Token-2022 program must produce the matching Token-2022 ATA derivation.
  const [ata] = findAssociatedTokenPda(umi, {
    mint: mint.publicKey,
    owner,
    tokenProgramId: tokenProgram,
  });
  await createIdempotentAssociatedToken(umi, {
    ata,
    owner,
    mint: mint.publicKey,
    tokenProgram,
  }).sendAndConfirm(umi); // No-op: the ATA already exists.

  const rawAta = await umi.rpc.getAccount(ata);
  t.is(rawAta.exists && publicKey(rawAta.owner), tokenProgram);
});
