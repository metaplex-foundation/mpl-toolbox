import { transactionBuilder } from '@metaplex-foundation/umi-test';
import test from 'ava';
import {
  createLut,
  fetchAddressLookupTable,
  findAddressLookupTablePda,
} from '../src';
import { createUmi } from './_setup';

test('it can create a new empty LUT with minimum configuration', async (t) => {
  // Given
  const umi = await createUmi();
  const recentSlot = await umi.rpc.getSlot({ commitment: 'finalized' });

  // When
  await transactionBuilder(umi)
    .add(createLut(umi, { recentSlot }))
    .sendAndConfirm();

  // Then
  const lut = findAddressLookupTablePda(umi, {
    authority: umi.identity.publicKey,
    recentSlot,
  });
  const lutAccount = await fetchAddressLookupTable(umi, lut);
  console.log(lutAccount);

  // // Then the account was created with the correct data.
  // const mintAccount = await fetchMint(metaplex, newAccount.publicKey);
  // const rentExemptBalance = await metaplex.rpc.getRent(getMintSize());
  // t.like(mintAccount, <Mint>{
  //   publicKey: newAccount.publicKey,
  //   header: {
  //     owner: metaplex.programs.get('splToken').publicKey,
  //     lamports: rentExemptBalance,
  //   },
  //   mintAuthority: some({ ...metaplex.identity.publicKey }),
  //   supply: 0n,
  //   decimals: 0,
  //   isInitialized: true,
  //   freezeAuthority: some({ ...metaplex.identity.publicKey }),
  // });

  // // And the payer was charged for the creation of the account.
  // const newPayerBalance = await metaplex.rpc.getBalance(
  //   metaplex.payer.publicKey
  // );
  // t.true(
  //   isEqualToAmount(
  //     newPayerBalance,
  //     subtractAmounts(payerBalance, rentExemptBalance),
  //     sol(0.0001) // (tolerance) Plus a bit more for the transaction fee.
  //   )
  // );
});

// with a custom authority
