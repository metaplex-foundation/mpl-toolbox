import {
  Context,
  OptionOrNullable,
  PublicKey,
  Signer,
  SolAmount,
  TransactionBuilder,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import { createAccount } from '../generated';
import {
  Extension,
  ExtensionArgs,
  TOKEN2022_PROGRAM_ID,
  initializeMint2,
} from '../generated-token2022';
import { getMintSize } from './getMintSize';
import {
  getPostInitializeInstructionsForMintExtensions,
  getPreInitializeInstructionsForMintExtensions,
} from './getInitializeInstructionsForExtensions';

// Extensions whose data is written _after_ the mint is initialized and which
// grow the account beyond its initially allocated space (they reallocate as
// needed). The account is therefore created without them.
const POST_INITIALIZE_EXTENSIONS: Array<Extension['__kind']> = [
  'TokenMetadata',
  'TokenGroup',
  'TokenGroupMember',
];

export type CreateMintWithExtensionsArgs = {
  /** The new mint account to create. */
  mint: Signer;
  /** Number of base-10 digits to the right of the decimal place. @defaultValue `0` */
  decimals?: number;
  /** The authority allowed to mint tokens and to configure extensions. */
  mintAuthority: Signer;
  /** The optional freeze authority of the mint. */
  freezeAuthority?: OptionOrNullable<PublicKey>;
  /** The mint extensions to initialize on the account. */
  extensions?: ExtensionArgs[];
  /**
   * Optional override for the lamports funding the mint account.
   * @defaultValue enough to make the fully-extended account rent-exempt.
   */
  lamports?: SolAmount;
};

/**
 * Builds the full instruction sequence to create a Token-2022 mint with the
 * given extensions: it creates and funds the account (sized for its pre-init
 * extensions, funded for its final size), runs the pre-initialize extension
 * instructions, initializes the mint, then runs the post-initialize extension
 * instructions (e.g. token metadata).
 */
export async function createMintWithExtensions(
  context: Pick<Context, 'programs' | 'rpc' | 'payer'>,
  input: CreateMintWithExtensionsArgs
): Promise<TransactionBuilder> {
  const extensions = input.extensions ?? [];
  const space = input.extensions
    ? getMintSize(
        extensions.filter(
          (extension) => !POST_INITIALIZE_EXTENSIONS.includes(extension.__kind)
        )
      )
    : getMintSize();
  const rentSpace = getMintSize(input.extensions);
  const accountLamports =
    input.lamports ?? (await context.rpc.getRent(rentSpace));
  const tokenProgram = context.programs.getPublicKey(
    'token2022',
    TOKEN2022_PROGRAM_ID
  );

  return transactionBuilder()
    .add(
      createAccount(context, {
        newAccount: input.mint,
        lamports: accountLamports,
        space,
        programId: tokenProgram,
      })
    )
    .add(
      getPreInitializeInstructionsForMintExtensions(
        context,
        input.mint.publicKey,
        extensions
      )
    )
    .add(
      initializeMint2(context, {
        mint: input.mint.publicKey,
        decimals: input.decimals ?? 0,
        mintAuthority: input.mintAuthority.publicKey,
        freezeAuthority: input.freezeAuthority,
      })
    )
    .add(
      getPostInitializeInstructionsForMintExtensions(
        context,
        input.mint.publicKey,
        input.mintAuthority,
        extensions
      )
    );
}
