import {
  generateSigner,
  Metaplex,
  Signer,
  transactionBuilder,
} from '@lorisleiva/js-core';
import test from 'ava';
import {
  createMint as baseCreateMint,
  createTokenIfMissing,
  fetchToken,
  findAssociatedTokenPda,
} from '../src';
import { createMetaplex } from './_setup';

test('it creates a new associated token if missing', async (t) => {
  // Given an existing mint and owner with no associated token account.
  const metaplex = await createMetaplex();
  const mint = (await createMint(metaplex)).publicKey;
  const owner = generateSigner(metaplex).publicKey;

  // When we execute the "CreateTokenIfMissing" instruction.
  await transactionBuilder(metaplex)
    .add(createTokenIfMissing(metaplex, { mint, owner }))
    .sendAndConfirm();

  // Then a new associated token account was created.
  const ata = findAssociatedTokenPda(metaplex, { mint, owner });
  const ataAccount = await fetchToken(metaplex, ata);
  console.log(ataAccount);
});

// it defaults to the identity if no owner is provided

// the payer pays for the storage fees if a token account gets created
// it does not create an account if an associated token account already exists
// it does not create an account if a regular token account already exists

// it fail if we provide the wrong system program
// it fail if we provide the wrong token program
// it fail if we provide the wrong ata program
// it fail if the ata account does not match the mint and owner
// it fail if the existing token account is not owned by the token program
// it fail if the existing token account is not associated with the given mint
// it fail if the existing token account is not associated with the given owner
// it fail if the non existing token account is not an ata account

async function createMint(metaplex: Metaplex): Promise<Signer> {
  const mint = generateSigner(metaplex);
  await transactionBuilder(metaplex)
    .add(baseCreateMint(metaplex, { mint }))
    .sendAndConfirm();
  return mint;
}
