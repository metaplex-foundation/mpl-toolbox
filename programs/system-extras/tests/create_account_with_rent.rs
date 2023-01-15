#![cfg(feature = "test-bpf")]

pub mod utils;

use crate::utils::{get_account, program_test, send_transaction};
use assert_matches::*;
use mpl_system_extras::instruction::create_account_with_rent_instruction;
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};
use solana_sdk::{
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use solana_validator::test_validator::*;

#[tokio::test]
async fn test_it_creates_an_account_with_minimum_rent_from_given_space() {
    // Given a brand new account keypair.
    let mut context = program_test().start_with_context().await;
    let new_account = Keypair::new();

    // When we create an account with 42 bytes of space, without specifying
    // the lamports, using the "CreateAccountWithRent" instruction.
    let transaction = Transaction::new_signed_with_payer(
        &[create_account_with_rent_instruction(
            &context.payer.pubkey(),
            &new_account.pubkey(),
            42,
            context.program_id,
        )],
        Some(&context.payer.pubkey()),
        &[&context.payer],
        context.last_blockhash,
    );
    send_transaction(&mut context, transaction).await?;

    // Then the right account space was allocated.
    let account = get_account(&mut context, &new_account.pubkey()).await;
    assert_eq!(account.data.len(), 42);

    // And the right amount of lamports was transferred to the new account.
    let rent = Rent::get()?;
    assert_eq!(account.lamports, rent.minimum_balance(42));
}

// Test: Not enough funds.
// Test: Different payer.
