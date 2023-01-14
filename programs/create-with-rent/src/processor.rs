use crate::instruction::CreateWithRentInstruction;
use borsh::BorshDeserialize;
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

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
    accounts: &'a [AccountInfo],
    args: CreateAccountWithRentArgs,
) -> ProgramResult {
    invoke_signed(
        &system_instruction::create(payer_info.key, new_account_info.key, required_lamports),
        &[
            payer_info.clone(),
            new_account_info.clone(),
            system_program_info.clone(),
        ],
        seeds,
    )?;

    Ok(())
}
