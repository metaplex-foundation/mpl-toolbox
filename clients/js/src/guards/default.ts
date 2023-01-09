import { AddressGateGuardSettings } from './addressGate';
import {
  AllowListGuardRouteSettings,
  AllowListGuardSettings,
} from './allowList';
import { BotTaxGuardSettings } from './botTax';
import {
  CandyGuardsData,
  CandyGuardsMintSettings,
  CandyGuardsRouteSettings,
  CandyGuardsSettings,
} from './core';
import { EndDateGuardSettings } from './endDate';
import {
  GatekeeperGuardMintSettings,
  GatekeeperGuardSettings,
} from './gatekeeper';
import { MintLimitGuardSettings } from './mintLimit';
import { NftBurnGuardMintSettings, NftBurnGuardSettings } from './nftBurn';
import { NftGateGuardMintSettings, NftGateGuardSettings } from './nftGate';
import {
  NftPaymentGuardMintSettings,
  NftPaymentGuardSettings,
} from './nftPayment';
import { ProgramGateGuardSettings } from './programGate';
import { RedeemedAmountGuardSettings } from './redeemedAmount';
import { SolPaymentGuardSettings } from './solPayment';
import { StartDateGuardSettings } from './startDate';
import {
  ThirdPartySignerGuardMintSettings,
  ThirdPartySignerGuardSettings,
} from './thirdPartySigner';
import { TokenBurnGuardSettings } from './tokenBurn';
import { TokenGateGuardSettings } from './tokenGate';
import { TokenPaymentGuardSettings } from './tokenPayment';
import {
  FreezeSolPaymentGuardRouteSettings,
  FreezeSolPaymentGuardSettings,
} from './freezeSolPayment';
import {
  FreezeTokenPaymentGuardRouteSettings,
  FreezeTokenPaymentGuardSettings,
} from './freezeTokenPayment';

/**
 * The settings for all default Candy Machine guards.
 */
export type DefaultCandyGuardSettings = CandyGuardsSettings & {
  botTax: BotTaxGuardSettings | null;
  solPayment: SolPaymentGuardSettings | null;
  tokenPayment: TokenPaymentGuardSettings | null;
  startDate: StartDateGuardSettings | null;
  thirdPartySigner: ThirdPartySignerGuardSettings | null;
  tokenGate: TokenGateGuardSettings | null;
  gatekeeper: GatekeeperGuardSettings | null;
  endDate: EndDateGuardSettings | null;
  allowList: AllowListGuardSettings | null;
  mintLimit: MintLimitGuardSettings | null;
  nftPayment: NftPaymentGuardSettings | null;
  redeemedAmount: RedeemedAmountGuardSettings | null;
  addressGate: AddressGateGuardSettings | null;
  nftGate: NftGateGuardSettings | null;
  nftBurn: NftBurnGuardSettings | null;
  tokenBurn: TokenBurnGuardSettings | null;
  freezeSolPayment: FreezeSolPaymentGuardSettings | null;
  freezeTokenPayment: FreezeTokenPaymentGuardSettings | null;
  programGate: ProgramGateGuardSettings | null;
};

/**
 * The data for all default Candy Machine guards.
 */
export type DefaultCandyGuardData = CandyGuardsData & {
  botTax: BotTaxGuardSettings | null;
  solPayment: SolPaymentGuardSettings | null; //
  tokenPayment: TokenPaymentGuardSettings | null;
  startDate: StartDateGuardSettings | null;
  thirdPartySigner: ThirdPartySignerGuardSettings | null;
  tokenGate: TokenGateGuardSettings | null;
  gatekeeper: GatekeeperGuardSettings | null;
  endDate: EndDateGuardSettings | null;
  allowList: AllowListGuardSettings | null;
  mintLimit: MintLimitGuardSettings | null;
  nftPayment: NftPaymentGuardSettings | null;
  redeemedAmount: RedeemedAmountGuardSettings | null;
  addressGate: AddressGateGuardSettings | null;
  nftGate: NftGateGuardSettings | null;
  nftBurn: NftBurnGuardSettings | null;
  tokenBurn: TokenBurnGuardSettings | null;
  freezeSolPayment: FreezeSolPaymentGuardSettings | null;
  freezeTokenPayment: FreezeTokenPaymentGuardSettings | null;
  programGate: ProgramGateGuardSettings | null;
};

/**
 * The mint settings for all default Candy Machine guards.
 */
export type DefaultCandyGuardMintSettings = CandyGuardsMintSettings & {
  // botTax: no mint settings
  // solPayment: no mint settings
  // tokenPayment: no mint settings
  // startDate: no mint settings
  thirdPartySigner: ThirdPartySignerGuardMintSettings | null;
  // tokenGate: no mint settings
  gatekeeper: GatekeeperGuardMintSettings | null;
  // endDate: no mint settings
  // allowList: no mint settings
  // mintLimit: no mint settings
  nftPayment: NftPaymentGuardMintSettings | null;
  // redeemedAmount: no mint settings
  // addressGate: no mint settings
  nftGate: NftGateGuardMintSettings | null;
  nftBurn: NftBurnGuardMintSettings | null;
  // tokenBurn: no mint settings
  // freezeSolPayment: no mint settings
  // freezeTokenPayment: no mint settings
  // programGate: no mint settings
};

/**
 * The mint settings for all default Candy Machine guards.
 */
export type DefaultCandyGuardRouteSettings = CandyGuardsRouteSettings & {
  // botTax: no route settings
  // solPayment: no route settings
  // tokenPayment: no route settings
  // startDate: no route settings
  // thirdPartySigner: no route settings
  // tokenGate: no route settings
  // gatekeeper: no route settings
  // endDate: no route settings
  allowList: AllowListGuardRouteSettings;
  // mintLimit: no route settings
  // nftPayment: no route settings
  // redeemedAmount: no route settings
  // addressGate: no route settings
  // nftGate: no route settings
  // nftBurn: no route settings
  // tokenBurn: no route settings
  freezeSolPayment: FreezeSolPaymentGuardRouteSettings;
  freezeTokenPayment: FreezeTokenPaymentGuardRouteSettings;
  // programGate: no route settings
};

/** @internal */
export const defaultCandyGuardNames: string[] = [
  'botTax',
  'solPayment',
  'tokenPayment',
  'startDate',
  'thirdPartySigner',
  'tokenGate',
  'gatekeeper',
  'endDate',
  'allowList',
  'mintLimit',
  'nftPayment',
  'redeemedAmount',
  'addressGate',
  'nftGate',
  'nftBurn',
  'tokenBurn',
  'freezeSolPayment',
  'freezeTokenPayment',
  'programGate',
];

/** @internal */
export const emptyDefaultCandyGuardSettings: {
  [key in keyof DefaultCandyGuardSettings]: null;
} = defaultCandyGuardNames.reduce((acc, name) => {
  acc[name] = null;
  return acc;
}, {} as { [key in keyof DefaultCandyGuardSettings]: null });
