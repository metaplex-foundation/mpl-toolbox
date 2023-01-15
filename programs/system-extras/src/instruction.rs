use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankInstruction;
use solana_program::pubkey::Pubkey;

#[derive(Debug, Clone, ShankInstruction, BorshSerialize, BorshDeserialize)]
#[rustfmt::skip]
pub enum SystemExtrasInstruction {
    /// Creates a new account with the amount of lamports equal to the rent exemption
    /// for the given data size. This enables clients to create accounts without
    /// having to query the cluster for the current rent exemption.
    #[account(0, writable, signer, name="payer", desc = "The account paying for the storage")]
    #[account(1, writable, signer, name="new_account", desc = "The account being created")]
    #[account(2, name="system_program", desc = "System program")]
    CreateAccountWithRent {
        /// The amount of space to allocate to the new account.
        /// Rent will be calculated based on this value.
        space: u64,
        /// The program that will own the new account.
        program_id: Pubkey,
    },

    /// Transfers all lamports from the source account to the destination account.
    /// This enables clients to transfer all lamports without having to query the
    /// source balance first and perform some custom heuristic on how much lamports
    /// to remove for the transaction fee.
    #[account(0, writable, signer, name="source", desc = "The source account sending all its lamports")]
    #[account(1, writable, name="destination", desc = "The destination account receiving the lamports")]
    #[account(2, name="system_program", desc = "System program")]
    TransferAllSol,
}
