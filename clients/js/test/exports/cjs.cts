// Type-checked with `moduleResolution: node16` and no `paths` alias, so the
// package resolves through the `require` condition to dist/types/index.d.ts.
import type { Pda, UmiPlugin } from '@metaplex-foundation/umi';
import {
  findAssociatedTokenPda,
  mplToolbox,
  token2022,
  TokenState,
} from '@metaplex-foundation/mpl-toolbox';

// Fails to compile if a type resolved to `any`, e.g. through a broken umi
// import inside the declarations.
type IsAny<T> = 0 extends 1 & T ? true : false;
type NotAny<T> = IsAny<T> extends true ? never : T;

export const plugin: NotAny<UmiPlugin> = mplToolbox();
export const ata: NotAny<Pda> = findAssociatedTokenPda(
  {} as Parameters<typeof findAssociatedTokenPda>[0],
  {} as Parameters<typeof findAssociatedTokenPda>[1]
);
export const mintSize: NotAny<number> = token2022.getMintSize([]);
export const state: NotAny<TokenState> = TokenState.Initialized;
export const pluginIsTyped: IsAny<ReturnType<typeof mplToolbox>> = false;
export const pdaIsTyped: IsAny<ReturnType<typeof findAssociatedTokenPda>> =
  false;
