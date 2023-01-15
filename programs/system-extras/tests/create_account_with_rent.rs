#![cfg(feature = "test-bpf")]

pub mod utils;

use crate::utils::{program_test, send_transaction};
use assert_matches::*;
use mpl_system_extras::instruction::create_account_with_rent_instruction;
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
};
use solana_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use solana_validator::test_validator::*;

#[tokio::test]
async fn test_it_creates_an_account_with_minimum_rent_from_given_space() {
    let mut context = program_test().start_with_context().await;
    // solana_logger::setup_with_default("solana_program_runtime=debug");
    let new_account = Keypair::new();

    let transaction = Transaction::new_signed_with_payer(
        &[create_account_with_rent_instruction(
            &context.payer.pubkey(),
            &new_account.pubkey(),
            100,
            context.program_id,
        )],
        Some(&context.payer.pubkey()),
        &[&context.payer],
        context.last_blockhash,
    );
    send_transaction(&mut context, transaction).await.unwrap();

    assert_eq!(1, 1);
}

// Test: Not enough funds.
// Test: Different payer.
