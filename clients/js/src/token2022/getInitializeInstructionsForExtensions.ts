import {
  Context,
  Option,
  PublicKey,
  Signer,
  TransactionBuilder,
  isNone,
  isOption,
  none,
  some,
  transactionBuilder,
} from '@metaplex-foundation/umi';
import {
  ExtensionArgs,
  disableCpiGuard,
  disableMemoTransfers,
  enableCpiGuard,
  enableMemoTransfers,
  initializeConfidentialMintBurn,
  initializeConfidentialTransferFee,
  initializeConfidentialTransferMint,
  initializeDefaultAccountState,
  initializeGroupMemberPointer,
  initializeGroupPointer,
  initializeInterestBearingMint,
  initializeMetadataPointer,
  initializeMintCloseAuthority,
  initializeNonTransferableMint,
  initializePausableConfig,
  initializePermanentDelegate,
  initializePermissionedBurn,
  initializeScaledUiAmountMint,
  initializeTokenGroup,
  initializeTokenMetadata,
  initializeTransferFeeConfig,
  initializeTransferHook,
} from '../generated-token2022';

type Ctx = Pick<Context, 'programs'>;

/** Normalizes a `T | Option<T> | null` value into a Umi `Option<T>`. */
function toOption<T>(value: Option<T> | T | null | undefined): Option<T> {
  if (isOption(value)) return value;
  return value === null || value === undefined ? none<T>() : some(value);
}

/**
 * Instructions that MUST run _before_ `initializeMint` to set up the given mint
 * extensions. Returns a `TransactionBuilder` you can prepend to the mint
 * creation.
 */
export function getPreInitializeInstructionsForMintExtensions(
  context: Ctx,
  mint: PublicKey,
  extensions: ExtensionArgs[]
): TransactionBuilder {
  let builder = transactionBuilder();
  extensions.forEach((extension) => {
    switch (extension.__kind) {
      case 'ConfidentialTransferMint':
        builder = builder.add(
          initializeConfidentialTransferMint(context, { mint, ...extension })
        );
        break;
      case 'ConfidentialMintBurn':
        builder = builder.add(
          initializeConfidentialMintBurn(context, {
            mint,
            supplyElgamalPubkey: extension.supplyElgamalPubkey,
            decryptableSupply: extension.decryptableSupply,
          })
        );
        break;
      case 'DefaultAccountState':
        builder = builder.add(
          initializeDefaultAccountState(context, {
            mint,
            state: extension.state,
          })
        );
        break;
      case 'TransferFeeConfig':
        builder = builder.add(
          initializeTransferFeeConfig(context, {
            mint,
            transferFeeConfigAuthority: extension.transferFeeConfigAuthority,
            withdrawWithheldAuthority: extension.withdrawWithheldAuthority,
            transferFeeBasisPoints: Number(
              extension.newerTransferFee.transferFeeBasisPoints.basisPoints
            ),
            maximumFee: extension.newerTransferFee.maximumFee,
          })
        );
        break;
      case 'MetadataPointer':
        builder = builder.add(
          initializeMetadataPointer(context, {
            mint,
            authority: extension.authority,
            metadataAddress: extension.metadataAddress,
          })
        );
        break;
      case 'InterestBearingConfig':
        builder = builder.add(
          initializeInterestBearingMint(context, {
            mint,
            rateAuthority: extension.rateAuthority,
            rate: extension.currentRate,
          })
        );
        break;
      case 'ScaledUiAmountConfig':
        builder = builder.add(
          initializeScaledUiAmountMint(context, {
            mint,
            authority: extension.authority,
            multiplier: extension.multiplier,
          })
        );
        break;
      case 'PausableConfig':
        builder = builder.add(
          initializePausableConfig(context, {
            mint,
            authority: extension.authority,
          })
        );
        break;
      case 'PermissionedBurn': {
        const authority = toOption<PublicKey>(extension.authority);
        if (isNone(authority)) {
          throw new Error(
            'PermissionedBurn extension requires a permissioned burn authority'
          );
        }
        builder = builder.add(
          initializePermissionedBurn(context, {
            mint,
            authority: authority.value,
          })
        );
        break;
      }
      case 'GroupPointer':
        builder = builder.add(
          initializeGroupPointer(context, {
            mint,
            authority: extension.authority,
            groupAddress: extension.groupAddress,
          })
        );
        break;
      case 'GroupMemberPointer':
        builder = builder.add(
          initializeGroupMemberPointer(context, {
            mint,
            authority: extension.authority,
            memberAddress: extension.memberAddress,
          })
        );
        break;
      case 'NonTransferable':
        builder = builder.add(initializeNonTransferableMint(context, { mint }));
        break;
      case 'TransferHook':
        builder = builder.add(
          initializeTransferHook(context, {
            mint,
            authority: extension.authority,
            programId: extension.programId,
          })
        );
        break;
      case 'PermanentDelegate':
        builder = builder.add(
          initializePermanentDelegate(context, {
            mint,
            delegate: extension.delegate,
          })
        );
        break;
      case 'ConfidentialTransferFee':
        builder = builder.add(
          initializeConfidentialTransferFee(context, {
            mint,
            authority: extension.authority,
            withdrawWithheldAuthorityElGamalPubkey: extension.elgamalPubkey,
          })
        );
        break;
      case 'MintCloseAuthority':
        builder = builder.add(
          initializeMintCloseAuthority(context, {
            mint,
            closeAuthority: extension.closeAuthority,
          })
        );
        break;
      default:
        break;
    }
  });
  return builder;
}

/**
 * Instructions that MUST run _after_ `initializeMint` to finalize the given
 * mint extensions (the ones that reallocate the account, such as token
 * metadata and token groups).
 */
export function getPostInitializeInstructionsForMintExtensions(
  context: Ctx,
  mint: PublicKey,
  mintAuthority: Signer,
  extensions: ExtensionArgs[]
): TransactionBuilder {
  let builder = transactionBuilder();
  extensions.forEach((extension) => {
    switch (extension.__kind) {
      case 'TokenMetadata': {
        const updateAuthority = toOption<PublicKey>(extension.updateAuthority);
        if (isNone(updateAuthority)) break;
        builder = builder.add(
          initializeTokenMetadata(context, {
            metadata: mint,
            updateAuthority: updateAuthority.value,
            mint,
            mintAuthority,
            name: extension.name,
            symbol: extension.symbol,
            uri: extension.uri,
          })
        );
        break;
      }
      case 'TokenGroup':
        builder = builder.add(
          initializeTokenGroup(context, {
            group: mint,
            updateAuthority: extension.updateAuthority,
            mint,
            mintAuthority,
            maxSize: extension.maxSize,
          })
        );
        break;
      default:
        break;
    }
  });
  return builder;
}

/**
 * Instructions that MUST run _after_ `initializeAccount` to finalize the given
 * token-account extensions (memo-transfer and CPI-guard toggles).
 */
export function getPostInitializeInstructionsForTokenExtensions(
  context: Ctx,
  token: PublicKey,
  owner: Signer | PublicKey,
  extensions: ExtensionArgs[]
): TransactionBuilder {
  let builder = transactionBuilder();
  extensions.forEach((extension) => {
    switch (extension.__kind) {
      case 'MemoTransfer':
        builder = builder.add(
          extension.requireIncomingTransferMemos
            ? enableMemoTransfers(context, { owner, token })
            : disableMemoTransfers(context, { owner, token })
        );
        break;
      case 'CpiGuard':
        builder = builder.add(
          extension.lockCpi
            ? enableCpiGuard(context, { owner, token })
            : disableCpiGuard(context, { owner, token })
        );
        break;
      default:
        break;
    }
  });
  return builder;
}
