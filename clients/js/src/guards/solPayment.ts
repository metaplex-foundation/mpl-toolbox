import {
  lamports,
  mapSerializer,
  PublicKey,
  SolAmount,
} from '@lorisleiva/js-core';
import { getSolPaymentSerializer } from '../generated';
import { CandyGuardManifest } from './core';

/**
 * The solPayment guard is used to charge an
 * amount in SOL for the minted NFT.
 *
 * This object defines the settings that should be
 * provided when creating and/or updating a Candy
 * Machine if you wish to enable this guard.
 */
export type SolPaymentGuard = {
  /** The amount in SOL to charge for. */
  amount: SolAmount;

  /** The configured destination address to send the funds to. */
  destination: PublicKey;
};

/** @internal */
export const solPaymentGuardManifest: CandyGuardManifest<SolPaymentGuard> = {
  name: 'solPayment',
  settingsBytes: 40,
  settingsSerializer: (context) =>
    mapSerializer(
      getSolPaymentSerializer(context),
      (settings) => ({
        lamports: settings.amount.basisPoints,
        destination: settings.destination,
      }),
      (settings) => ({
        amount: lamports(settings.lamports),
        destination: settings.destination,
      })
    ),
  mintSettingsParser: (context, { settings }) => ({
    arguments: new Uint8Array(),
    remainingAccounts: [
      {
        isSigner: false,
        address: settings.destination,
        isWritable: true,
      },
    ],
  }),
};
