import {
  generateSigner,
  isEqualToAmount,
  none,
  sol,
  subtractAmounts,
  transactionBuilder,
} from '@lorisleiva/js-test';
import test from 'ava';
import {
  createMint,
  createToken,
  fetchToken,
  getTokenSize,
  Token,
  TokenState,
} from '../src';
import { createMetaplex } from './_setup';

test('it can create new token accounts with minimum configuration', async (t) => {
  // Given a payer, an account signer and an existing mint.
  const metaplex = await createMetaplex();
  const payerBalance = await metaplex.rpc.getBalance(metaplex.payer.publicKey);
  const newMint = generateSigner(metaplex);
  const newToken = generateSigner(metaplex);
  await transactionBuilder(metaplex)
    .add(createMint(metaplex, { mint: newMint }))
    .sendAndConfirm();

  // When we create a new token account with minimum configuration.
  await transactionBuilder(metaplex)
    .add(createToken(metaplex, { token: newToken, mint: newMint.publicKey }))
    .sendAndConfirm();

  // Then the account was created with the correct data.
  const mintAccount = await fetchToken(metaplex, newToken.publicKey);
  const rentExemptBalance = await metaplex.rpc.getRent(getTokenSize());
  t.like(mintAccount, <Token>{
    address: newToken.publicKey,
    header: {
      owner: metaplex.programs.getToken().address,
      lamports: rentExemptBalance,
    },
    mint: newMint.publicKey,
    owner: metaplex.identity.publicKey,
    amount: 0n,
    delegate: none(),
    state: TokenState.Initialized,
    isNative: none(),
    delegatedAmount: 0n,
    closeAuthority: none(),
  });

  // And the payer was charged for the creation of the account.
  const newPayerBalance = await metaplex.rpc.getBalance(
    metaplex.payer.publicKey
  );
  t.true(
    isEqualToAmount(
      newPayerBalance,
      subtractAmounts(payerBalance, rentExemptBalance),
      sol(0.0001) // (tolerance) Plus a bit more for the transaction fee.
    )
  );
});

// test('it can create new token accounts with maximum configuration', async (t) => {
//   // Given an account signer and a mint authority.
//   const metaplex = await createMetaplex();
//   const newAccount = generateSigner(metaplex);
//   const mintAuthority = generateSigner(metaplex).publicKey;

//   // When we create a new mint account with all configuration options.
//   await transactionBuilder(metaplex)
//     .add(
//       createMint(metaplex, {
//         mint: newAccount,
//         decimals: 9,
//         mintAuthority,
//         freezeAuthority: none(),
//       })
//     )
//     .sendAndConfirm();

//   // Then the account was created with the correct data.
//   const mintAccount = await fetchMint(metaplex, newAccount.publicKey);
//   const rentExemptBalance = await metaplex.rpc.getRent(getMintSize());
//   t.like(mintAccount, <Mint>{
//     address: newAccount.publicKey,
//     header: {
//       owner: metaplex.programs.getToken().address,
//       lamports: rentExemptBalance,
//     },
//     mintAuthority: some(mintAuthority),
//     supply: 0n,
//     decimals: 9,
//     isInitialized: true,
//     freezeAuthority: none(),
//   });
// });
