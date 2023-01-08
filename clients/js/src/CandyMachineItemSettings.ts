/**
 * Settings that makes items in the Candy Machine hidden by
 * providing a single URI for all minted NFTs and the hash of a file that
 * maps mint number to actual NFT URIs.
 *
 * Hidden settings serve two purposes.
 * - First, it allows the creation of larger drops (20k+), since
 *   the JSON metadata URIs are not stored on-chain for each item.
 * - In turn, this also allows the creation of hide-and-reveal drops,
 *   where users discover which items they minted after the mint is complete.
 *
 * Once hidden settings are enabled, every minted NFT will have the same URI and the
 * name will be created by appending the mint number (e.g., “#45”) to the specified
 * name. The hash is expected to be a 32 character string corresponding to
 * the hash of a cache file that has the mapping between a mint number and the
 * actual metadata URI. This allows the order of the mint to be verified by
 * others after the mint is complete.
 *
 * Since the metadata URIs are not on-chain, it is possible to create very large
 * drops. The only caveat is that there is a need for an off-chain process to
 * update the metadata for each item. This is important otherwise all items
 * will have the same metadata.
 */
export type CandyMachineHiddenSettings = {
  /** Identifier used to distinguish the various types of item settings. */
  readonly type: 'hidden';

  /**
   * The base name for all minted NFTs.
   *
   * You can use the following variables in the name:
   * - `$ID$`: The index of the item (starting at 0).
   * - `$ID+1$`: The number of the item (starting at 1).
   */
  readonly name: string;

  /**
   * The URI shared by all minted NFTs.
   *
   * You can use the following variables in the URI:
   * - `$ID$`: The index of the item (starting at 0).
   * - `$ID+1$`: The number of the item (starting at 1).
   */
  readonly uri: string;

  /**
   * A 32-character hash. In most cases this is the hash of the
   * cache file with the mapping between mint numbers and metadata URIs
   * so that the order can be verified when the mint is complete.
   */
  readonly hash: number[];
};

/**
 * A set of settings that aim to reduce the size of the Candy Machine
 * whilst allowing items to be manually inserted for more flexibility.
 *
 * This introduces `name` and `uri` prefixes that will be used for each
 * item inserted.
 *
 * @example
 * For instance, say all inserted items will have the following structure,
 * where zeros represent the dynamic part of the name and URI:
 * - name: "My NFT Project #0000"
 * - uri: "https://arweave.net/00000000000000000000"
 *
 * Then we can use the following prefixes:
 * - prefixName: "My NFT Project #"
 * - prefixUri: "https://arweave.net/"
 *
 * And the following lengths:
 * - nameLength: 4 (assuming we'll never have more than 9999 items)
 * - uriLength: 20
 *
 * We could even go one step further and set the `nameLength` to zero by
 * relying on template variables in the name prefix:
 * - prefixName: "My NFT Project #$ID+1$"
 * - nameLength: 0
 *
 * Now, the program will automatically append the item number to the
 * name of each minted NFT.
 */
export type CandyMachineConfigLineSettings = {
  /** Identifier used to distinguish the various types of item settings. */
  readonly type: 'configLines';

  /**
   * The prefix of the name of each item.
   *
   * The following template variables can be used:
   * - `$ID$`: The index of the item (starting at 0).
   * - `$ID+1$`: The number of the item (starting at 1).
   */
  readonly prefixName: string;

  /**
   * The maximum length to use for the name of inserted items
   * excluding the length of the prefix.
   *
   * For instance, if the name prefix is "My NFT Project #" and we want to
   * add item numbers up to 9999, we would set this value to 4.
   */
  readonly nameLength: number;

  /**
   * The prefix of the URI of each item.
   *
   * The following template variables can be used:
   * - `$ID$`: The index of the item (starting at 0).
   * - `$ID+1$`: The number of the item (starting at 1).
   */
  readonly prefixUri: string;

  /**
   * The maximum length to use for the URI of inserted items
   * excluding the length of the prefix.
   *
   * For instance, if the URI prefix is "https://arweave.net/" and we assume
   * Arweave identifiers are 20 characters long max, we would set this value to 20.
   */
  readonly uriLength: number;

  /**
   * Indicates whether to use a sequential index generator or not.
   * When set to `true`, NFTs will be minted sequentially.
   * When set to `false`, NFTs will be minted in a random order.
   */
  readonly isSequential: boolean;
};
