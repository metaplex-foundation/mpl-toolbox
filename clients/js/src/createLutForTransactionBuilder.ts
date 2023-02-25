import {
  chunk,
  Context,
  PublicKey,
  Signer,
  transactionBuilder,
  TransactionBuilder,
} from '@metaplex-foundation/umi-core';
import { closeLut, createLut, findAddressLookupTablePda } from './generated';
import { extendLut } from './instructions';

export const createLutForTransactionBuilder = (
  context: Pick<
    Context,
    | 'rpc'
    | 'eddsa'
    | 'programs'
    | 'serializer'
    | 'transactions'
    | 'identity'
    | 'payer'
  >,
  builder: TransactionBuilder,
  recentSlot: number,
  authority?: Signer,
  recipient?: PublicKey
): {
  lutAccounts: { publicKey: PublicKey; addresses: PublicKey[] }[];
  createLutBuilders: TransactionBuilder[];
  builder: TransactionBuilder;
  closeLutBuilders: TransactionBuilder[];
} => {
  const lutAuthority = authority ?? context.identity;
  const lutRecipient = recipient ?? context.payer.publicKey;

  const tx = builder.setBlockhash('11111111111111111111111111111111').build();
  const extractableAddresses = tx.message.accounts.slice(
    tx.message.header.numRequiredSignatures
  );

  const lutAccounts = [] as { publicKey: PublicKey; addresses: PublicKey[] }[];
  const createLutBuilders = [] as TransactionBuilder[];
  let closeLutBuilder = transactionBuilder(context);

  chunk(extractableAddresses, 256).forEach((addresses, index) => {
    const localRecentSlot = recentSlot - index;
    const lut = findAddressLookupTablePda(context, {
      authority: lutAuthority.publicKey,
      recentSlot: localRecentSlot,
    });
    lutAccounts.push({ publicKey: lut, addresses });
    createLutBuilders.push(
      ...generateCreateLutBuilders(
        context,
        transactionBuilder(context).add(
          createLut(context, { recentSlot: localRecentSlot })
        ),
        lut,
        lutAuthority,
        addresses
      )
    );
    closeLutBuilder = closeLutBuilder.add(
      closeLut(context, {
        address: lut,
        authority: lutAuthority,
        recipient: lutRecipient,
      })
    );
  });

  // Set address lookup tables on the original builder.
  builder = builder.setAddressLookupTables(lutAccounts);

  return {
    lutAccounts,
    createLutBuilders,
    builder,
    closeLutBuilders: [closeLutBuilder],
  };
};

function generateCreateLutBuilders(
  context: Pick<Context, 'programs' | 'serializer' | 'identity' | 'payer'>,
  builder: TransactionBuilder,
  lutAddress: PublicKey,
  lutAuthority: Signer,
  addresses: PublicKey[]
): TransactionBuilder[] {
  const builders = [] as TransactionBuilder[];
  let addressesThatFit = [] as PublicKey[];
  let lastValidBuilder = builder;

  addresses.forEach((address) => {
    const newBuilder = builder.add(
      extendLut(context, {
        address: lutAddress,
        addresses: [...addressesThatFit, address],
        authority: lutAuthority,
      })
    );
    if (newBuilder.fitsInOneTransaction()) {
      addressesThatFit.push(address);
      lastValidBuilder = newBuilder;
    } else {
      addressesThatFit = [address];
      builders.push(lastValidBuilder);
      builder = builder.empty();
      lastValidBuilder = builder;
    }
  });

  if (addressesThatFit.length > 0) {
    builders.push(lastValidBuilder);
  }

  return builders;
}
