import {
  assertAccountExists,
  Context,
  PublicKey,
  RpcAccount,
} from '@lorisleiva/js-core';
import { CandyGuard, deserializeCandyGuard } from './CandyGuard';
import { CandyMachine, deserializeCandyMachine } from './CandyMachine';
import { CandyGuardsSettings, DefaultCandyGuardSettings } from './guards';

export type CandyMachineWithGuards<
  T extends CandyGuardsSettings = DefaultCandyGuardSettings
> = CandyMachine & { candyGuard: CandyGuard<T> };

export async function fetchCandyMachineWithGuards(
  context: Pick<Context, 'rpc' | 'serializer'>,
  candyMachineAddress: PublicKey,
  candyGuardAddress: PublicKey
): Promise<CandyMachineWithGuards> {
  // TODO: default candyGuardAddress to derive from candyMachineAddress
  const [candyMachine, candyGuard] = await context.rpc.getAccounts([
    candyMachineAddress,
    candyGuardAddress,
  ]);
  assertAccountExists(candyMachine, 'CandyMachine');
  assertAccountExists(candyGuard, 'CandyGuard');
  return deserializeCandyMachineWithGuards(context, candyMachine, candyGuard);
}

export async function safeFetchCandyMachineWithGuards(
  context: Pick<Context, 'rpc' | 'serializer'>,
  candyMachineAddress: PublicKey,
  candyGuardAddress: PublicKey
): Promise<CandyMachineWithGuards | null> {
  // TODO: default candyGuardAddress to derive from candyMachineAddress
  const [candyMachine, candyGuard] = await context.rpc.getAccounts([
    candyMachineAddress,
    candyGuardAddress,
  ]);
  return candyMachine.exists && candyGuard.exists
    ? deserializeCandyMachineWithGuards(context, candyMachine, candyGuard)
    : null;
}

export function deserializeCandyMachineWithGuards(
  context: Pick<Context, 'serializer'>,
  rawCandyMachineAccount: RpcAccount,
  rawCandyGuardAccount: RpcAccount
): CandyMachineWithGuards {
  const candyMachine = deserializeCandyMachine(context, rawCandyMachineAccount);
  const candyGuard = deserializeCandyGuard(context, rawCandyGuardAccount);
  return { ...candyMachine, candyGuard };
}
