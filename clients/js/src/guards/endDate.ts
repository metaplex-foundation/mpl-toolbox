import { EndDate, EndDateArgs, getEndDateSerializer } from '../generated';
import { CandyGuardManifest } from './core';

/**
 * The endDate guard is used to specify a date to end the mint.
 * Any transaction received after the end date will fail.
 *
 * This object defines the settings that should be
 * provided when creating and/or updating a Candy
 * Machine if you wish to enable this guard.
 */
export type EndDateGuard = EndDate;

/** @see {@link EndDateGuard} */
export type EndDateGuardSettings = EndDateArgs;

/** @internal */
export const endDateGuardManifest: CandyGuardManifest<
  EndDateGuardSettings,
  EndDateGuard
> = {
  name: 'endDate',
  settingsBytes: 8,
  settingsSerializer: getEndDateSerializer,
};
