use borsh::BorshDeserialize;
use solana_program::account_info::next_account_info;
use solana_program::program::invoke;
use solana_program::rent::Rent;
use solana_program::sysvar::Sysvar;
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey, system_instruction,
};

use crate::instruction::{CreateAccountWithRentArgs, CreateWithRentInstruction};

pub struct Processor;
impl Processor {
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction: CreateWithRentInstruction =
            CreateWithRentInstruction::try_from_slice(instruction_data)?;
        match instruction {
            CreateWithRentInstruction::CreateAccountWithRent(args) => {
                create_account_with_rent(program_id, accounts, args)
            }
        }
    }
}

fn create_account_with_rent(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    args: CreateAccountWithRentArgs,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let new_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let rent = Rent::get()?;
    let lamports: u64 = rent.minimum_balance(args.space as usize);

    // TODO: Ensure system_program is the system program.

    invoke(
        &system_instruction::create_account(
            payer.key,
            new_account.key,
            lamports,
            args.space,
            &args.program_id,
        ),
        &[payer.clone(), new_account.clone(), system_program.clone()],
    )?;

    Ok(())
}
