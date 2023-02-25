import {
  base58PublicKey,
  chunk,
  Context,
  PublicKey,
  Signer,
  transactionBuilder,
  TransactionBuilder,
} from '@metaplex-foundation/umi-core';
import { createLut, findAddressLookupTablePda } from './generated';
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
  authority?: Signer
): {
  createLutBuilders: TransactionBuilder[];
  builder: TransactionBuilder;
  closeLutBuilders: TransactionBuilder[];
} => {
  const lutAuthority = authority ?? context.identity;

  const tx = builder.setBlockhash('11111111111111111111111111111111').build();
  const addresses = tx.message.accounts;
  const extractableAddresses = addresses.slice(
    tx.message.header.numRequiredSignatures
  );

  const lutAccounts = [] as { publicKey: PublicKey; addresses: PublicKey[] }[];
  const lutBuilders = [] as TransactionBuilder[];
  const chunks = chunk(extractableAddresses, 256);

  chunks.forEach((lutAddresses, index) => {
    const lutRecentSlot = recentSlot - index;
    const lut = findAddressLookupTablePda(context, {
      authority: lutAuthority.publicKey,
      recentSlot: lutRecentSlot,
    });
    lutAccounts.push({ publicKey: lut, addresses: lutAddresses });
    lutBuilders.push(
      ...generateCreateLutBuilders(
        context,
        transactionBuilder(context).add(
          createLut(context, { recentSlot: lutRecentSlot })
        ),
        lut,
        lutAuthority,
        lutAddresses
      )
    );
  });

  // TODO: Close builders.

  console.log({
    addresses: addresses.map(base58PublicKey),
    extractableAddresses: extractableAddresses.map(base58PublicKey),
    header: tx.message.header,
    lutAccounts,
    lutBuilders: lutBuilders[0].items,
  });

  return {
    lutBuilders,
    builder,
  } as any;
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
