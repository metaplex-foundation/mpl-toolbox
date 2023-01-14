use borsh::BorshDeserialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

use crate::instruction::SystemExtrasInstruction;

pub struct Processor;
impl Processor {
    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction: SystemExtrasInstruction =
            SystemExtrasInstruction::try_from_slice(instruction_data)?;
        match instruction {
            SystemExtrasInstruction::CreateAccountWithRent {
                space,
                program_id: program_owner,
            } => create_account_with_rent(accounts, space, program_owner),
        }
    }
}

fn create_account_with_rent(
    accounts: &[AccountInfo],
    space: u64,
    program_owner: Pubkey,
) -> ProgramResult {
    // Accounts.
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let new_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let rent = Rent::get()?;

    // Args.
    let lamports: u64 = rent.minimum_balance(space as usize);

    // Guards.
    // TODO: Ensure system_program is the system program?

    invoke(
        &system_instruction::create_account(
            payer.key,
            new_account.key,
            lamports,
            space,
            &program_owner,
        ),
        &[payer.clone(), new_account.clone(), system_program.clone()],
    )?;

    Ok(())
}
