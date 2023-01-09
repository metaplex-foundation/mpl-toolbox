import { Context, PublicKey, Serializer, Signer } from '@lorisleiva/js-core';

/**
 * When creating your own custom guards, you will need to register them
 * with the JS SDK by creating a `CandyGuardManifest` which lets the SDK
 * know how to interact with your guard.
 */
export type CandyGuardManifest<
  Settings extends object,
  MintSettings extends object = {},
  RouteSettings extends object = {}
> = {
  /**
   * The name of your guard. This should match the name provided in the
   * `availableGuards` array of your registered `CandyGuardProgram`.
   */
  name: string;

  /**
   * The total amount of bytes required to serialize your guard's settings.
   * Contratry to the usual Borsh serialization, this size is fixed and should
   * represent the maximum space required for your guard's settings.
   */
  settingsBytes: number;

  /**
   * The serializer used to serialize and deserialize your guard's settings.
   */
  settingsSerializer(
    context: Pick<Context, 'serializer'>
  ): Serializer<Settings>;

  /**
   * If your guard requires additional accounts or arguments to be passed
   * to the `mint` instruction, this function parses the predefined `mintSettings`
   * of your guards into the required arguments and remaining accounts.
   */
  mintSettingsParser?: (
    context: Pick<Context, 'serializer' | 'programs'>,
    input: MintSettingsParserInput<Settings, MintSettings>
  ) => {
    /** The serialized arguments to pass to the mint instruction. */
    arguments: Uint8Array;
    /** {@inheritDoc CandyGuardsRemainingAccount} */
    remainingAccounts: CandyGuardsRemainingAccount[];
  };

  /**
   * If your guard support the "route" instruction which allows you to execute
   * a custom instruction on the guard, this function parses the predefined
   * `routeSettings` of your guards into the required arguments and remaining accounts.
   */
  routeSettingsParser?: (
    context: Pick<Context, 'serializer' | 'programs'>,
    input: RouteSettingsParserInput<Settings, RouteSettings>
  ) => {
    /** The serialized arguments to pass to the route instruction. */
    arguments: Uint8Array;
    /** {@inheritDoc CandyGuardsRemainingAccount} */
    remainingAccounts: CandyGuardsRemainingAccount[];
  };
};

/** The input passed to each guard when building the mint instruction. */
export type MintSettingsParserInput<Settings, MintSettings> = {
  /** The guard's settings. */
  settings: Settings;
  /** The optional mint settings. */
  mintSettings: MintSettings | null;
  /** The owner of the minted NFT, this is typically the payer. */
  owner: PublicKey;
  /** The minting wallet as a Signer. */
  payer: Signer;
  /** The NFT mint account as a Signer. */
  mint: Signer;
  /** The address of the Candy Machine we are minting from. */
  candyMachine: PublicKey;
  /** The address of the Candy Guard we are minting from. */
  candyGuard: PublicKey;
  /** The address of the Candy Guard's authority. */
  candyGuardAuthority: PublicKey;
};

/** The input passed to each guard when building the route instruction. */
export type RouteSettingsParserInput<Settings, RouteSettings> = {
  /** The guard's settings. */
  settings: Settings;
  /** The route settings for that guard. */
  routeSettings: RouteSettings;
  /** The payer for the route instruction. */
  payer: Signer;
  /** The address of the Candy Machine we are routing from. */
  candyMachine: PublicKey;
  /** The address of the Candy Guard we are routing from. */
  candyGuard: PublicKey;
  /** The address of the Candy Guard's authority. */
  candyGuardAuthority: PublicKey;
};

/**
 * Sets expectations on Candy Guard settings which
 * uses the name of the guard as the key and, if enabled,
 * the settings of the guard as the value.
 */
export type CandyGuardsSettings = {
  [name: string]: object | null;
};

/**
 * Sets expectations on Candy Guard mint settings which
 * uses the name of the guard as the key and, if applicable,
 * the mint settings of the guard as the value.
 */
export type CandyGuardsMintSettings = {
  [name: string]: object | null;
};

/**
 * Sets expectations on Candy Guard route settings which
 * uses the name of the guard as the key and the route
 * settings of the guard as the value.
 */
export type CandyGuardsRouteSettings = {
  [name: string]: object;
};

/**
 * A remain account to push to the mint or route instruction.
 * When `isSigner` is true, the `address` attribute must be `Signer`
 * and it will be pushed to the `signers` array of the transaction.
 */
export type CandyGuardsRemainingAccount =
  | {
      isSigner: false;
      address: PublicKey;
      isWritable: boolean;
    }
  | {
      isSigner: true;
      address: Signer;
      isWritable: boolean;
    };
