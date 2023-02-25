import {
  base58PublicKey,
  Context,
  Signer,
  TransactionBuilder,
} from '@metaplex-foundation/umi-core';
import { findAddressLookupTablePda } from './generated';

export const createLutForTransactionBuilder = (
  context: Pick<Context, 'eddsa' | 'programs' | 'serializer' | 'identity'>,
  builder: TransactionBuilder,
  recentSlot: number,
  authority?: Signer
): {
  createLutBuilders: TransactionBuilder[];
  builder: TransactionBuilder;
  closeLutBuilders: TransactionBuilder[];
} => {
  const lutAuthority = authority ?? context.identity;
  const lut = findAddressLookupTablePda(context, {
    authority: lutAuthority.publicKey,
    recentSlot,
  });

  const tx = builder.setBlockhash('11111111111111111111111111111111').build();
  const addresses = tx.message.accounts;

  console.log({
    lut: base58PublicKey(lut),
    addresses: addresses.map(base58PublicKey),
  });

  // const builder = transactionBuilder(umi)
  //   .add(createLut(umi, { recentSlot }))
  //   .add(extendLut(umi, { address: lut, addresses }));

  // console.log({
  //   getTransactionSize: builder.getTransactionSize(),
  //   minimumTransactionsRequired: builder.minimumTransactionsRequired(),
  // });

  return {
    builder,
  } as any;
};
