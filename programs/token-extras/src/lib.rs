pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;

pub use solana_program;

pub struct ParsedTokenFields {
    pub mint: solana_program::pubkey::Pubkey,
    pub owner: solana_program::pubkey::Pubkey,
}

solana_program::declare_id!("TokExjvjJmhKaRBShsBAsbSvEWMA1AgUNK7ps4SAc2p");
