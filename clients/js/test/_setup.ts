/* eslint-disable import/no-extraneous-dependencies */
import {
  createMetaplex as baseCreateMetaplex,
  generateSigner,
  Metaplex,
  Option,
  PublicKey,
  Signer,
  transactionBuilder,
} from '@lorisleiva/js-test';
import {
  mplEssentials,
  createMint as baseCreateMint,
  createToken as baseCreateToken,
  mintTokensTo,
} from '../src';

export const createMetaplex = async () =>
  (await baseCreateMetaplex()).use(mplEssentials());

export const createMint = async (
  metaplex: Metaplex,
  input: {
    decimals?: number;
    mintAuthority?: PublicKey;
    freezeAuthority?: Option<PublicKey>;
  } = {}
): Promise<Signer> => {
  const mint = generateSigner(metaplex);
  await transactionBuilder(metaplex)
    .add(baseCreateMint(metaplex, { mint, ...input }))
    .sendAndConfirm();
  return mint;
};

export const createToken = async (
  metaplex: Metaplex,
  input: {
    mint: PublicKey;
    amount?: number | bigint;
    owner?: PublicKey;
    mintAuthority?: Signer;
  }
): Promise<Signer> => {
  const token = generateSigner(metaplex);
  let builder = transactionBuilder(metaplex).add(
    baseCreateToken(metaplex, {
      token,
      mint: input.mint,
      owner: input.owner,
    })
  );
  if (input.amount) {
    builder = builder.add(
      mintTokensTo(metaplex, {
        mint: input.mint,
        mintAuthority: input.mintAuthority,
        token: token.publicKey,
        amount: input.amount,
      })
    );
  }
  await builder.sendAndConfirm();
  return token;
};

export const createMintAndToken = async (
  metaplex: Metaplex,
  input: {
    decimals?: number;
    mintAuthority?: Signer;
    freezeAuthority?: Option<PublicKey>;
    owner?: PublicKey;
    amount?: number | bigint;
  } = {}
): Promise<[Signer, Signer]> => {
  const mint = await createMint(metaplex, {
    decimals: input.decimals,
    mintAuthority: input.mintAuthority?.publicKey,
    freezeAuthority: input.freezeAuthority,
  });
  const token = await createToken(metaplex, {
    mint: mint.publicKey,
    amount: input.amount,
    owner: input.owner,
    mintAuthority: input.mintAuthority,
  });
  return [mint, token];
};
