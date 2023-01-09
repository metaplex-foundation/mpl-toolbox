import { AddressGateGuard } from './addressGate';
import { AllowListGuardRouteSettings, AllowListGuard } from './allowList';
import { BotTaxGuard } from './botTax';
import {
  CandyGuardsData,
  CandyGuardsMintSettings,
  CandyGuardsRouteSettings,
  CandyGuardsSettings,
} from './core';
import { EndDateGuard, EndDateGuardSettings } from './endDate';
import { GatekeeperGuardMintSettings, GatekeeperGuard } from './gatekeeper';
import { MintLimitGuard } from './mintLimit';
import { NftBurnGuardMintSettings, NftBurnGuard } from './nftBurn';
import { NftGateGuardMintSettings, NftGateGuard } from './nftGate';
import { NftPaymentGuardMintSettings, NftPaymentGuard } from './nftPayment';
import { ProgramGateGuard } from './programGate';
import { RedeemedAmountGuard } from './redeemedAmount';
import { SolPaymentGuard } from './solPayment';
import { StartDateGuard } from './startDate';
import {
  ThirdPartySignerGuardMintSettings,
  ThirdPartySignerGuard,
} from './thirdPartySigner';
import { TokenBurnGuard } from './tokenBurn';
import { TokenGateGuard } from './tokenGate';
import { TokenPaymentGuard } from './tokenPayment';
import {
  FreezeSolPaymentGuardRouteSettings,
  FreezeSolPaymentGuard,
} from './freezeSolPayment';
import {
  FreezeTokenPaymentGuardRouteSettings,
  FreezeTokenPaymentGuard,
} from './freezeTokenPayment';

/**
 * The settings for all default Candy Machine guards.
 * TODO: Use settings when settings > data.
 */
export type DefaultCandyGuardSettings = CandyGuardsSettings & {
  botTax: BotTaxGuard | null;
  solPayment: SolPaymentGuard | null;
  tokenPayment: TokenPaymentGuard | null;
  startDate: StartDateGuard | null;
  thirdPartySigner: ThirdPartySignerGuard | null;
  tokenGate: TokenGateGuard | null;
  gatekeeper: GatekeeperGuard | null;
  endDate: EndDateGuardSettings | null;
  allowList: AllowListGuard | null;
  mintLimit: MintLimitGuard | null;
  nftPayment: NftPaymentGuard | null;
  redeemedAmount: RedeemedAmountGuard | null;
  addressGate: AddressGateGuard | null;
  nftGate: NftGateGuard | null;
  nftBurn: NftBurnGuard | null;
  tokenBurn: TokenBurnGuard | null;
  freezeSolPayment: FreezeSolPaymentGuard | null;
  freezeTokenPayment: FreezeTokenPaymentGuard | null;
  programGate: ProgramGateGuard | null;
};

/**
 * The data for all default Candy Machine guards.
 */
export type DefaultCandyGuardData = CandyGuardsData & {
  botTax: BotTaxGuard | null;
  solPayment: SolPaymentGuard | null; //
  tokenPayment: TokenPaymentGuard | null;
  startDate: StartDateGuard | null;
  thirdPartySigner: ThirdPartySignerGuard | null;
  tokenGate: TokenGateGuard | null;
  gatekeeper: GatekeeperGuard | null;
  endDate: EndDateGuard | null;
  allowList: AllowListGuard | null;
  mintLimit: MintLimitGuard | null;
  nftPayment: NftPaymentGuard | null;
  redeemedAmount: RedeemedAmountGuard | null;
  addressGate: AddressGateGuard | null;
  nftGate: NftGateGuard | null;
  nftBurn: NftBurnGuard | null;
  tokenBurn: TokenBurnGuard | null;
  freezeSolPayment: FreezeSolPaymentGuard | null;
  freezeTokenPayment: FreezeTokenPaymentGuard | null;
  programGate: ProgramGateGuard | null;
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
export const emptyDefaultCandyGuard: {
  [key in keyof DefaultCandyGuardSettings]: null;
} = defaultCandyGuardNames.reduce((acc, name) => {
  acc[name] = null;
  return acc;
}, {} as { [key in keyof DefaultCandyGuardSettings]: null });
