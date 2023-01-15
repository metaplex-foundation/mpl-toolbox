use num_derive::FromPrimitive;
use solana_program::{
    decode_error::DecodeError,
    msg,
    program_error::{PrintProgramError, ProgramError},
};
use thiserror::Error;

#[derive(Error, Clone, Debug, Eq, PartialEq, FromPrimitive)]
pub enum TokenExtrasError {
    #[error("Invalid System Program")]
    InvalidSystemProgram,
}

impl PrintProgramError for TokenExtrasError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<TokenExtrasError> for ProgramError {
    fn from(e: TokenExtrasError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for TokenExtrasError {
    fn type_of() -> &'static str {
        "Create With Rent Error"
    }
}
