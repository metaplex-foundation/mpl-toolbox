import {
  chunk,
  Context,
  PublicKey,
  Signer,
  TransactionBuilder,
  uniquePublicKeys,
} from '@metaplex-foundation/umi';
import { createLut, findAddressLookupTablePda } from './generated';
import { extendLut } from './instructions';

export const createLutForTransactionBuilder = (
  context: Pick<
    Context,
    'eddsa' | 'programs' | 'serializer' | 'transactions' | 'identity' | 'payer'
  >,
  builder: TransactionBuilder,
  recentSlot: number,
  authority?: Signer
): {
  lutAccounts: { publicKey: PublicKey; addresses: PublicKey[] }[];
  createLutBuilders: TransactionBuilder[];
  builder: TransactionBuilder;
} => {
  const lutAuthority = authority ?? context.identity;

  const signerAddresses = uniquePublicKeys([
    builder.getFeePayer(context).publicKey,
    ...builder.items.flatMap(({ instruction }) =>
      instruction.keys
        .filter((meta) => meta.isSigner)
        .map((meta) => meta.pubkey)
    ),
  ]);

  const extractableAddresses = uniquePublicKeys(
    builder.items.flatMap(({ instruction }) => [
      instruction.programId,
      ...instruction.keys.map((meta) => meta.pubkey),
    ])
  ).filter((address) => !signerAddresses.includes(address));

  const lutAccounts = [] as { publicKey: PublicKey; addresses: PublicKey[] }[];
  const createLutBuilders = [] as TransactionBuilder[];

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
        createLut(context, { recentSlot: localRecentSlot }),
        lut,
        lutAuthority,
        addresses
      )
    );
  });

  // Set address lookup tables on the original builder.
  builder = builder.setAddressLookupTables(lutAccounts);

  return {
    lutAccounts,
    createLutBuilders,
    builder,
  };
};

function generateCreateLutBuilders(
  context: Pick<
    Context,
    'programs' | 'serializer' | 'identity' | 'payer' | 'transactions'
  >,
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
    if (newBuilder.fitsInOneTransaction(context)) {
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
