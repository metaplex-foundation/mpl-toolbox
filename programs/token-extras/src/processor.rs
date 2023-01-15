use crate::error::TokenExtrasError;
use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction, system_program,
    sysvar::Sysvar,
};

use crate::instruction::TokenExtrasInstruction;

pub struct Processor;

impl Processor {
    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction: TokenExtrasInstruction =
            TokenExtrasInstruction::try_from_slice(instruction_data)?;
        match instruction {
            TokenExtrasInstruction::CreateTokenIfMissing => create_token_if_missing(accounts),
        }
    }
}

fn create_token_if_missing(accounts: &[AccountInfo]) -> ProgramResult {
    // Accounts.
    let account_info_iter = &mut accounts.iter();
    let token = next_account_info(account_info_iter)?;
    let mint = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;
    let ata = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let ata_program = next_account_info(account_info_iter)?;

    // Guards.
    if *system_program.key != system_program::id() {
        return Err(TokenExtrasError::InvalidSystemProgram.into());
    }

    // CPI to the System Program.
    // invoke(
    //     &system_instruction::create_account(
    //         payer.key,
    //         new_account.key,
    //         lamports,
    //         space,
    //         &program_owner,
    //     ),
    //     &[payer.clone(), new_account.clone(), system_program.clone()],
    // )?;

    Ok(())
}

