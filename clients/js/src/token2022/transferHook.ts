import {
  AccountMeta,
  Context,
  Pda,
  PublicKey,
  Signer,
  TransactionBuilder,
  publicKey,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  bool,
  publicKey as publicKeySerializer,
  u32,
  u64,
} from '@metaplex-foundation/umi/serializers';
import { fetchMint, transferChecked } from '../generated-token2022';

const EXTRA_ACCOUNT_METAS_SEED = new TextEncoder().encode(
  'extra-account-metas'
);
// A transfer hook validation account is a TLV account: an 8-byte type
// discriminator and a 4-byte length precede the extra-account-meta list.
const ACCOUNT_DATA_PREFIX_SIZE = 8 + 4;
const ADDRESS_CONFIG_SIZE = 32;
// `ExtraAccountMeta` discriminator flagging a PDA derived off the hook program.
const PROGRAM_PDA_DISCRIMINATOR = 1;
// PDAs derived off a previously resolved account use `128 + accountIndex`.
const ACCOUNT_PDA_DISCRIMINATOR_OFFSET = 128;
// `spl-transfer-hook-interface:execute`, as `sha256(namespace)[0..8]`.
const EXECUTE_DISCRIMINATOR = new Uint8Array([
  105, 37, 101, 197, 75, 251, 102, 26,
]);

/**
 * Finds the PDA storing the list of extra accounts required by a mint's
 * transfer hook program (the "validation account").
 */
export function findExtraAccountMetaListPda(
  context: Pick<Context, 'eddsa'>,
  mint: PublicKey,
  transferHookProgram: PublicKey
): Pda {
  return context.eddsa.findPda(transferHookProgram, [
    EXTRA_ACCOUNT_METAS_SEED,
    publicKeySerializer().serialize(mint),
  ]);
}

// A single seed in an `ExtraAccountMeta`'s packed config: a literal, or a
// reference to the instruction data or a previously resolved account.
type ExtraAccountMetaSeed =
  | { kind: 'Literal'; bytes: Uint8Array }
  | { kind: 'InstructionData'; index: number; length: number }
  | { kind: 'AccountKey'; index: number }
  | {
      kind: 'AccountData';
      accountIndex: number;
      dataIndex: number;
      length: number;
    };

type ExtraAccountMetaPubkeyData =
  | { kind: 'InstructionData'; index: number }
  | { kind: 'AccountData'; accountIndex: number; dataIndex: number };

type ExtraAccountMetaConfig =
  | { kind: 'Literal'; address: PublicKey }
  | { kind: 'PubkeyData'; pubkeyData: ExtraAccountMetaPubkeyData }
  | { kind: 'ProgramPda'; seeds: ExtraAccountMetaSeed[] }
  | { kind: 'AccountPda'; accountIndex: number; seeds: ExtraAccountMetaSeed[] };

type ExtraAccountMeta = {
  config: ExtraAccountMetaConfig;
  isSigner: boolean;
  isWritable: boolean;
};

// Parses the packed seed list from a 32-byte `addressConfig`, stopping at a `0`
// (`Uninitialized`) discriminator or the end of the slot.
function parseSeeds(config: Uint8Array): ExtraAccountMetaSeed[] {
  const seeds: ExtraAccountMetaSeed[] = [];
  let offset = 0;
  while (offset < config.length && config[offset] !== 0) {
    const discriminator = config[offset];
    offset += 1;
    switch (discriminator) {
      case 1: {
        const length = config[offset];
        offset += 1;
        seeds.push({
          kind: 'Literal',
          bytes: config.slice(offset, offset + length),
        });
        offset += length;
        break;
      }
      case 2:
        seeds.push({
          kind: 'InstructionData',
          index: config[offset],
          length: config[offset + 1],
        });
        offset += 2;
        break;
      case 3:
        seeds.push({ kind: 'AccountKey', index: config[offset] });
        offset += 1;
        break;
      case 4:
        seeds.push({
          kind: 'AccountData',
          accountIndex: config[offset],
          dataIndex: config[offset + 1],
          length: config[offset + 2],
        });
        offset += 3;
        break;
      default:
        throw new Error(
          `Invalid transfer hook seed: unknown discriminator ${discriminator}.`
        );
    }
  }
  return seeds;
}

function parsePubkeyData(config: Uint8Array): ExtraAccountMetaPubkeyData {
  const discriminator = config[0];
  if (discriminator === 1) return { kind: 'InstructionData', index: config[1] };
  if (discriminator === 2)
    return {
      kind: 'AccountData',
      accountIndex: config[1],
      dataIndex: config[2],
    };
  throw new Error(
    `Invalid transfer hook pubkey data: unknown discriminator ${discriminator}.`
  );
}

function unpackAddressConfig(
  discriminator: number,
  config: Uint8Array
): ExtraAccountMetaConfig {
  if (discriminator === 0) {
    return {
      kind: 'Literal',
      address: publicKeySerializer().deserialize(config)[0],
    };
  }
  if (discriminator === 2) {
    return { kind: 'PubkeyData', pubkeyData: parsePubkeyData(config) };
  }
  if (discriminator === PROGRAM_PDA_DISCRIMINATOR) {
    return { kind: 'ProgramPda', seeds: parseSeeds(config) };
  }
  const accountIndex = discriminator - ACCOUNT_PDA_DISCRIMINATOR_OFFSET;
  if (accountIndex < 0) {
    throw new Error(
      `Invalid transfer hook extra account meta: unknown discriminator ${discriminator}.`
    );
  }
  return { kind: 'AccountPda', accountIndex, seeds: parseSeeds(config) };
}

/** Decodes a transfer hook validation account's data into its extra metas. */
export function decodeExtraAccountMetas(data: Uint8Array): ExtraAccountMeta[] {
  if (data.length < ACCOUNT_DATA_PREFIX_SIZE) {
    throw new Error(
      'Invalid transfer hook validation account: data is shorter than the ' +
        `expected ${ACCOUNT_DATA_PREFIX_SIZE}-byte account prefix.`
    );
  }
  let offset = ACCOUNT_DATA_PREFIX_SIZE;
  const [count, afterCount] = u32().deserialize(data, offset);
  offset = afterCount;
  const metas: ExtraAccountMeta[] = [];
  for (let i = 0; i < count; i += 1) {
    const discriminator = data[offset];
    offset += 1;
    const addressConfig = data.slice(offset, offset + ADDRESS_CONFIG_SIZE);
    offset += ADDRESS_CONFIG_SIZE;
    const [isSigner, afterSigner] = bool().deserialize(data, offset);
    offset = afterSigner;
    const [isWritable, afterWritable] = bool().deserialize(data, offset);
    offset = afterWritable;
    metas.push({
      config: unpackAddressConfig(discriminator, addressConfig),
      isSigner,
      isWritable,
    });
  }
  return metas;
}

async function fetchAccountData(
  context: Pick<Context, 'rpc'>,
  address: PublicKey
): Promise<Uint8Array> {
  const account = await context.rpc.getAccount(address);
  if (!account.exists) {
    throw new Error(
      `Invalid transfer hook seed: account ${address} was not found.`
    );
  }
  return account.data;
}

async function resolveSeed(
  context: Pick<Context, 'rpc'>,
  seed: ExtraAccountMetaSeed,
  previousMetas: PublicKey[],
  instructionData: Uint8Array
): Promise<Uint8Array> {
  switch (seed.kind) {
    case 'Literal':
      return seed.bytes;
    case 'InstructionData':
      return instructionData.slice(seed.index, seed.index + seed.length);
    case 'AccountKey':
      return publicKeySerializer().serialize(previousMetas[seed.index]);
    case 'AccountData': {
      const data = await fetchAccountData(
        context,
        previousMetas[seed.accountIndex]
      );
      return data.slice(seed.dataIndex, seed.dataIndex + seed.length);
    }
    default:
      throw new Error('Invalid transfer hook seed.');
  }
}

async function resolvePubkeyData(
  context: Pick<Context, 'rpc'>,
  config: ExtraAccountMetaPubkeyData,
  previousMetas: PublicKey[],
  instructionData: Uint8Array
): Promise<PublicKey> {
  if (config.kind === 'InstructionData') {
    return publicKeySerializer().deserialize(instructionData, config.index)[0];
  }
  const data = await fetchAccountData(
    context,
    previousMetas[config.accountIndex]
  );
  return publicKeySerializer().deserialize(data, config.dataIndex)[0];
}

async function resolveExtraAccountMeta(
  context: Pick<Context, 'eddsa' | 'rpc'>,
  extraMeta: ExtraAccountMeta,
  previousMetas: PublicKey[],
  instructionData: Uint8Array,
  transferHookProgram: PublicKey
): Promise<{ address: PublicKey; isSigner: boolean; isWritable: boolean }> {
  const { config, isSigner, isWritable } = extraMeta;
  if (config.kind === 'Literal') {
    return { address: config.address, isSigner, isWritable };
  }
  if (config.kind === 'PubkeyData') {
    const address = await resolvePubkeyData(
      context,
      config.pubkeyData,
      previousMetas,
      instructionData
    );
    return { address, isSigner, isWritable };
  }
  const program =
    config.kind === 'ProgramPda'
      ? transferHookProgram
      : previousMetas[config.accountIndex];
  const seeds = await Promise.all(
    config.seeds.map((seed) =>
      resolveSeed(context, seed, previousMetas, instructionData)
    )
  );
  const [address] = context.eddsa.findPda(program, seeds);
  return { address, isSigner, isWritable };
}

// Downgrades a resolved meta so it never claims more privilege (signer or
// writable) than the transfer's base accounts already grant that address.
function deEscalate(
  meta: AccountMeta,
  accountMetas: AccountMeta[]
): AccountMeta {
  const existing = accountMetas.filter((m) => m.pubkey === meta.pubkey);
  if (existing.length === 0) return meta;
  return {
    pubkey: meta.pubkey,
    isSigner: meta.isSigner && existing.some((m) => m.isSigner),
    isWritable: meta.isWritable && existing.some((m) => m.isWritable),
  };
}

export type ResolveExtraAccountMetasForExecuteInput = {
  source: PublicKey;
  mint: PublicKey;
  destination: PublicKey;
  owner: PublicKey;
  amount: number | bigint;
  transferHookProgram: PublicKey;
  /** The validation account. Derived via {@link findExtraAccountMetaListPda} if omitted. */
  validateStatePubkey?: PublicKey;
};

/**
 * Resolves the extra accounts a transfer hook program's `Execute` CPI needs,
 * ready to append to a `transferChecked` instruction: each configured extra
 * account (resolved and de-escalated against the transfer's base accounts and
 * each other), followed by the hook program and its validation account.
 *
 * Returns an empty array if the mint has no transfer hook validation account.
 */
export async function resolveExtraAccountMetasForExecute(
  context: Pick<Context, 'eddsa' | 'rpc'>,
  input: ResolveExtraAccountMetasForExecuteInput
): Promise<AccountMeta[]> {
  const validateStatePubkey =
    input.validateStatePubkey ??
    findExtraAccountMetaListPda(
      context,
      input.mint,
      input.transferHookProgram
    )[0];

  const validateState = await context.rpc.getAccount(validateStatePubkey);
  if (!validateState.exists) return [];

  const extraMetas = decodeExtraAccountMetas(validateState.data);
  const instructionData = new Uint8Array([
    ...EXECUTE_DISCRIMINATOR,
    ...u64().serialize(input.amount),
  ]);

  const baseMetas: AccountMeta[] = [
    input.source,
    input.mint,
    input.destination,
    input.owner,
    validateStatePubkey,
  ].map((pubkey) => ({ pubkey, isSigner: false, isWritable: false }));
  const previousAddresses: PublicKey[] = baseMetas.map((meta) => meta.pubkey);
  const resolvedMetas: AccountMeta[] = [];

  // Sequential: later metas can reference the addresses resolved before them.
  // eslint-disable-next-line no-restricted-syntax
  for (const extraMeta of extraMetas) {
    // eslint-disable-next-line no-await-in-loop
    const resolved = await resolveExtraAccountMeta(
      context,
      extraMeta,
      previousAddresses,
      instructionData,
      input.transferHookProgram
    );
    const deEscalated = deEscalate(
      {
        pubkey: resolved.address,
        isSigner: resolved.isSigner,
        isWritable: resolved.isWritable,
      },
      [...baseMetas, ...resolvedMetas]
    );
    resolvedMetas.push(deEscalated);
    previousAddresses.push(resolved.address);
  }

  return [
    ...resolvedMetas,
    { pubkey: input.transferHookProgram, isSigner: false, isWritable: false },
    { pubkey: validateStatePubkey, isSigner: false, isWritable: false },
  ];
}

export type TransferCheckedWithTransferHookArgs = {
  source: PublicKey | Pda;
  mint: PublicKey | Pda;
  destination: PublicKey | Pda;
  authority?: PublicKey | Pda | Signer;
  /** The wallet that owns the source account (used to resolve hook accounts). */
  owner: PublicKey;
  amount: number | bigint;
  decimals: number;
};

/**
 * Builds a Token-2022 `transferChecked` instruction, appending the extra
 * accounts the mint's transfer hook program needs when the mint has the
 * transfer hook extension configured. When the mint has no transfer hook, the
 * returned builder is a plain `transferChecked`.
 */
export async function transferCheckedWithTransferHook(
  context: Pick<Context, 'eddsa' | 'rpc' | 'programs' | 'identity'>,
  input: TransferCheckedWithTransferHookArgs
): Promise<TransactionBuilder> {
  const builder = transferChecked(context, {
    source: input.source,
    mint: input.mint,
    destination: input.destination,
    authority: input.authority,
    amount: input.amount,
    decimals: input.decimals,
  });

  const mintPublicKey = publicKey(input.mint);
  const mintAccount = await fetchMint(context, mintPublicKey);
  const extensions =
    mintAccount.extensions.__option === 'Some'
      ? mintAccount.extensions.value
      : [];
  const transferHook = extensions.find(
    (extension) => extension.__kind === 'TransferHook'
  );
  if (transferHook === undefined || transferHook.__kind !== 'TransferHook') {
    return builder;
  }

  const extraMetas = await resolveExtraAccountMetasForExecute(context, {
    source: publicKey(input.source),
    mint: mintPublicKey,
    destination: publicKey(input.destination),
    owner: input.owner,
    amount: input.amount,
    transferHookProgram: transferHook.programId,
  });
  if (extraMetas.length === 0) return builder;

  return transactionBuilder(
    builder.items.map((item) => ({
      ...item,
      instruction: {
        ...item.instruction,
        keys: [...item.instruction.keys, ...extraMetas],
      },
    }))
  );
}
