use borsh::{BorshDeserialize, BorshSerialize};
use shank::ShankInstruction;
use solana_program::pubkey::Pubkey;

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct CreateAccountWithRentArgs {
    /// The amount of space to allocate to the new account.
    /// Rent will be calculated based on this value.
    space: u64,
    /// The program that will own the new account.
    program_id: Pubkey,
}

#[derive(Debug, Clone, ShankInstruction, BorshSerialize, BorshDeserialize)]
#[rustfmt::skip]
pub enum CreateWithRentInstruction {
    /// Creates a new account with the amount of lamports equal to the rent exemption
    /// for the given data size. This enables clients to create accounts without
    /// having to query the cluster for the current rent exemption.
    #[account(0, writable, signer, name="payer", desc = "The account paying for the storage")]
    #[account(1, writable, signer, name="new_account", desc = "The account being created")]
    #[account(2, name="system_program", desc = "System program")]
    CreateAccountWithRent(CreateAccountWithRentArgs),
}
