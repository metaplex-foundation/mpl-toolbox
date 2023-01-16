import {
  generateSigner,
  isEqualToAmount,
  sol,
  some,
  subtractAmounts,
  transactionBuilder,
} from '@lorisleiva/js-test';
import test from 'ava';
import { createMint, fetchMint, Mint } from '../src';
import { createMetaplex } from './_setup';

test('it can create new mint accounts with minimum configuration', async (t) => {
  // Given a payer and an account signer.
  const metaplex = await createMetaplex();
  const payerBalance = await metaplex.rpc.getBalance(metaplex.payer.publicKey);
  const newAccount = generateSigner(metaplex);

  // When we create a new account at this address with no additional configuration.
  await transactionBuilder(metaplex)
    .add(createMint(metaplex, { mint: newAccount }))
    .sendAndConfirm();

  // Then the account was created with the correct data.
  const mintAccount = await fetchMint(metaplex, newAccount.publicKey);
  t.like(mintAccount, <Mint>{
    address: newAccount.publicKey,
    header: {
      owner: metaplex.programs.getToken().address,
    },
    mintAuthority: some(metaplex.identity.publicKey),
    supply: 0n,
    decimals: 0,
    isInitialized: true,
    freezeAuthority: some(metaplex.identity.publicKey),
  });

  // And the payer was charged for the creation of the account.
  const newPayerBalance = await metaplex.rpc.getBalance(
    metaplex.payer.publicKey
  );
  t.true(
    isEqualToAmount(
      newPayerBalance,
      subtractAmounts(payerBalance, sol(1.5)),
      sol(0.0001) // (tolerance) Plus a bit more for the transaction fee.
    )
  );
});
