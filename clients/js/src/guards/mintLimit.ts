import { getMintLimitSerializer } from '../generated';
import { CandyGuardManifest } from './core';

/**
 * The mintLimit guard allows to specify a limit on the
 * number of mints for each individual wallet.
 *
 * The limit is set per wallet, per candy machine and per
 * identified (provided in the settings) to allow multiple
 * mint limits within a Candy Machine. This is particularly
 * useful when using groups of guards and we want each of them
 * to have a different mint limit.
 *
 * This object defines the settings that should be
 * provided when creating and/or updating a Candy
 * Machine if you wish to enable this guard.
 */
export type MintLimitGuard = {
  /**
   * A unique identitifer for the limit
   * for a given wallet and candy machine.
   */
  id: number;

  /** The maximum number of mints allowed. */
  limit: number;
};

/** @internal */
export const mintLimitGuardManifest: CandyGuardManifest<MintLimitGuard> = {
  name: 'mintLimit',
  settingsBytes: 3,
  settingsSerializer: getMintLimitSerializer,
  mintSettingsParser: (context, { data, payer, candyMachine, candyGuard }) => {
    const counterPda = findMintLimitCounterPda(context, {
      id: data.id,
      user: payer.publicKey,
      candyMachine,
      candyGuard,
    });

    return {
      arguments: new Uint8Array(),
      remainingAccounts: [
        {
          address: counterPda,
          isSigner: false,
          isWritable: true,
        },
      ],
    };
  },
};
