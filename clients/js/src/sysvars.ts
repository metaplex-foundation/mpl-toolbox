import { PublicKey, publicKey, SdkError } from '@metaplex-foundation/umi';

export type Sysvar =
  | 'clock'
  | 'epochSchedule'
  | 'instructions'
  | 'recentBlockhashes'
  | 'rent'
  | 'rewards'
  | 'slotHashes'
  | 'slotHistory'
  | 'stakeHistory';

export const getSysvar = (sysvar: Sysvar): PublicKey => {
  switch (sysvar) {
    case 'clock':
      return publicKey('SysvarC1ock11111111111111111111111111111111');
    case 'epochSchedule':
      return publicKey('SysvarEpochSchedu1e111111111111111111111111');
    case 'instructions':
      return publicKey('SysvarC1ock11111111111111111111111111111111');
    case 'recentBlockhashes':
      return publicKey('SysvarRecentB1ockHashes11111111111111111111');
    case 'rent':
      return publicKey('SysvarRent111111111111111111111111111111111');
    case 'rewards':
      return publicKey('SysvarRewards111111111111111111111111111111');
    case 'slotHashes':
      return publicKey('SysvarS1otHashes111111111111111111111111111');
    case 'slotHistory':
      return publicKey('SysvarS1otHistory11111111111111111111111111');
    case 'stakeHistory':
      return publicKey('SysvarStakeHistory1111111111111111111111111');
    default:
      throw new SdkError(`Unknown sysvar: ${sysvar satisfies never}`);
  }
};
