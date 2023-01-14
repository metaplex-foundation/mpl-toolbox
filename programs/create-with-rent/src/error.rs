use num_derive::FromPrimitive;
use solana_program::{
    decode_error::DecodeError,
    msg,
    program_error::{PrintProgramError, ProgramError},
};
use thiserror::Error;

#[derive(Error, Clone, Debug, Eq, PartialEq, FromPrimitive)]
pub enum CreateWithRentError {
    /// Error description
    #[error("Error message")]
    ErrorName,
}

impl PrintProgramError for CreateWithRentError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<CreateWithRentError> for ProgramError {
    fn from(e: CreateWithRentError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for CreateWithRentError {
    fn type_of() -> &'static str {
        "Error Thingy"
    }
}
