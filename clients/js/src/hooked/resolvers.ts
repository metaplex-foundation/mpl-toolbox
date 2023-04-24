import { PublicKey } from '@metaplex-foundation/umi';

export const resolveExtendLutBytes = (
  context: any,
  accounts: any,
  args: { addresses: Array<PublicKey> },
  programId: any
): number => 32 * args.addresses.length;
