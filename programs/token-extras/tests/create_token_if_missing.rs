#![cfg(feature = "test-bpf")]

pub mod utils;

mod create_token_if_missing {
    use crate::utils::{create_mint, get_account, get_token, program_test, send_transaction};
    use assert_matches::assert_matches;
    use borsh::BorshSerialize;
    use mpl_token_extras::instruction::{
        create_token_if_missing_instruction, TokenExtrasInstruction,
    };
    use solana_program::{
        instruction::{AccountMeta, Instruction, InstructionError::Custom},
        system_program,
    };
    use solana_program_test::*;
    use solana_sdk::{
        signature::{Keypair, Signer},
        transaction::{Transaction, TransactionError},
    };
    use spl_associated_token_account::get_associated_token_address;

    #[tokio::test]
    async fn test_it_creates_a_new_associated_token_if_missing() {
        // Given a mint/owner pair without an existing associated token account.
        let mut context = program_test().start_with_context().await;
        let mint = Keypair::new();
        let mint_authority = Keypair::new();
        let owner = Keypair::new();
        let new_token = get_associated_token_address(&owner.pubkey(), &mint.pubkey());
        create_mint(&mut context, &mint, &mint_authority.pubkey(), None)
            .await
            .unwrap();

        // When we call the "CreateTokenIfMissing" instruction.
        let transaction = Transaction::new_signed_with_payer(
            &[create_token_if_missing_instruction(
                &context.payer.pubkey(),
                &new_token,
                &mint.pubkey(),
                &owner.pubkey(),
                &new_token,
            )],
            Some(&context.payer.pubkey()),
            &[&context.payer],
            context.last_blockhash,
        );
        send_transaction(&mut context, transaction).await.unwrap();

        // Then an associated token account was created with the expected data.
        let raw_account = get_account(&mut context, &new_token).await;
        let parsed_account = get_token(&mut context, &new_token).await;
        assert_eq!(raw_account.owner, spl_token::id());
        assert_eq!(parsed_account.mint, mint.pubkey());
        assert_eq!(parsed_account.owner, owner.pubkey());
    }

    // TODO: test the payer pays for the storage.
    // TODO: test fail for wrong programs and wrong paths.

    #[tokio::test]
    async fn test_it_fail_if_we_provide_the_wrong_system_program() {
        // Given a mint/owner pair.
        let mut context = program_test().start_with_context().await;
        let mint = Keypair::new();
        let owner = Keypair::new();
        let new_token = get_associated_token_address(&owner.pubkey(), &mint.pubkey());

        // And a fake system program.
        let fake_system_program = Keypair::new().pubkey();

        // When we try to create a token account if missing.
        let transaction = Transaction::new_signed_with_payer(
            &[Instruction {
                program_id: mpl_token_extras::id(),
                accounts: vec![
                    AccountMeta::new(context.payer.pubkey(), true),
                    AccountMeta::new_readonly(new_token, false),
                    AccountMeta::new_readonly(mint.pubkey(), false),
                    AccountMeta::new_readonly(owner.pubkey(), false),
                    AccountMeta::new(new_token, false),
                    AccountMeta::new_readonly(fake_system_program, false),
                    AccountMeta::new_readonly(spl_token::id(), false),
                    AccountMeta::new_readonly(spl_associated_token_account::id(), false),
                ],
                data: TokenExtrasInstruction::CreateTokenIfMissing
                    .try_to_vec()
                    .unwrap(),
            }],
            Some(&context.payer.pubkey()),
            &[&context.payer],
            context.last_blockhash,
        );
        let result = send_transaction(&mut context, transaction).await;

        // Then we expect a custom program error.
        assert_matches!(
            result.unwrap_err().unwrap(),
            TransactionError::InstructionError(0, Custom(0))
        );
    }

    #[tokio::test]
    async fn test_it_fail_if_we_provide_the_wrong_token_program() {
        // Given a mint/owner pair.
        let mut context = program_test().start_with_context().await;
        let mint = Keypair::new();
        let owner = Keypair::new();
        let new_token = get_associated_token_address(&owner.pubkey(), &mint.pubkey());

        // And a fake token program.
        let fake_token_program = Keypair::new().pubkey();

        // When we try to create a token account if missing.
        let transaction = Transaction::new_signed_with_payer(
            &[Instruction {
                program_id: mpl_token_extras::id(),
                accounts: vec![
                    AccountMeta::new(context.payer.pubkey(), true),
                    AccountMeta::new_readonly(new_token, false),
                    AccountMeta::new_readonly(mint.pubkey(), false),
                    AccountMeta::new_readonly(owner.pubkey(), false),
                    AccountMeta::new(new_token, false),
                    AccountMeta::new_readonly(system_program::id(), false),
                    AccountMeta::new_readonly(fake_token_program, false),
                    AccountMeta::new_readonly(spl_associated_token_account::id(), false),
                ],
                data: TokenExtrasInstruction::CreateTokenIfMissing
                    .try_to_vec()
                    .unwrap(),
            }],
            Some(&context.payer.pubkey()),
            &[&context.payer],
            context.last_blockhash,
        );
        let result = send_transaction(&mut context, transaction).await;

        // Then we expect a custom program error.
        assert_matches!(
            result.unwrap_err().unwrap(),
            TransactionError::InstructionError(0, Custom(1))
        );
    }

    #[tokio::test]
    async fn test_it_fail_if_we_provide_the_wrong_ata_program() {
        // Given a mint/owner pair.
        let mut context = program_test().start_with_context().await;
        let mint = Keypair::new();
        let owner = Keypair::new();
        let new_token = get_associated_token_address(&owner.pubkey(), &mint.pubkey());

        // And a fake ata program.
        let fake_ata_program = Keypair::new().pubkey();

        // When we try to create a token account if missing.
        let transaction = Transaction::new_signed_with_payer(
            &[Instruction {
                program_id: mpl_token_extras::id(),
                accounts: vec![
                    AccountMeta::new(context.payer.pubkey(), true),
                    AccountMeta::new_readonly(new_token, false),
                    AccountMeta::new_readonly(mint.pubkey(), false),
                    AccountMeta::new_readonly(owner.pubkey(), false),
                    AccountMeta::new(new_token, false),
                    AccountMeta::new_readonly(system_program::id(), false),
                    AccountMeta::new_readonly(spl_token::id(), false),
                    AccountMeta::new_readonly(fake_ata_program, false),
                ],
                data: TokenExtrasInstruction::CreateTokenIfMissing
                    .try_to_vec()
                    .unwrap(),
            }],
            Some(&context.payer.pubkey()),
            &[&context.payer],
            context.last_blockhash,
        );
        let result = send_transaction(&mut context, transaction).await;

        // Then we expect a custom program error.
        assert_matches!(
            result.unwrap_err().unwrap(),
            TransactionError::InstructionError(0, Custom(2))
        );
    }
}
