use solana_program_test::ProgramTest;

pub fn program_test() -> ProgramTest {
    ProgramTest::new("mpl_system_extras", mpl_system_extras::id(), None)
}
