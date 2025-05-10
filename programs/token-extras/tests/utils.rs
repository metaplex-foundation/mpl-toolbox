use mpl_token_extras::ParsedTokenFields;
use solana_program::{program_pack::Pack, pubkey::Pubkey, rent::Rent, system_instruction};
use solana_program_test::{BanksClientError, ProgramTest, ProgramTestContext};
use solana_sdk::{
    account::Account,
    instruction::Instruction,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use spl_token_2022::extension::ExtensionType;

pub fn program_test() -> ProgramTest {
    ProgramTest::new("mpl_token_extras", mpl_token_extras::id(), None)
}

pub async fn send_transaction(
    context: &mut ProgramTestContext,
    transaction: Transaction,
) -> Result<(), BanksClientError> {
    context.banks_client.process_transaction(transaction).await
}

pub async fn airdrop(context: &mut ProgramTestContext, receiver: &Pubkey, amount: u64) -> () {
    let transaction = Transaction::new_signed_with_payer(
        &[system_instruction::transfer(
            &context.payer.pubkey(),
            receiver,
            amount,
        )],
        Some(&context.payer.pubkey()),
        &[&context.payer],
        context.last_blockhash,
    );

    send_transaction(context, transaction).await.unwrap()
}

pub async fn get_account(context: &mut ProgramTestContext, pubkey: &Pubkey) -> Account {
    context
        .banks_client
        .get_account(*pubkey)
        .await
        .expect("account not found")
        .expect("account empty")
}

pub async fn get_balance(context: &mut ProgramTestContext, pubkey: &Pubkey) -> u64 {
    let account = context
        .banks_client
        .get_account(*pubkey)
        .await
        .expect("account not found");

    match account {
        Some(account) => account.lamports,
        None => 0,
    }
}

pub async fn get_rent(context: &mut ProgramTestContext) -> Rent {
    context.banks_client.get_rent().await.unwrap()
}

pub async fn create_mint(
    context: &mut ProgramTestContext,
    mint: &Keypair,
    mint_authority: &Pubkey,
    freeze_authority: Option<&Pubkey>,
    token_program: &Pubkey,
) -> Result<(), BanksClientError> {
    let rent = context.banks_client.get_rent().await.unwrap();

    let data_length: usize;
    let init_ix;

    if *token_program == spl_token::id() {
        data_length = spl_token::state::Mint::LEN;
        init_ix = spl_token::instruction::initialize_mint(
            &spl_token::id(),
            &mint.pubkey(),
            mint_authority,
            freeze_authority,
            0,
        ).unwrap();
    } else if *token_program == spl_token_2022::id() {
        data_length =
            ExtensionType::try_calculate_account_len::<spl_token_2022::state::Mint>(&[]).unwrap();
        init_ix = spl_token_2022::instruction::initialize_mint(
            &spl_token_2022::id(),
            &mint.pubkey(),
            mint_authority,
            freeze_authority,
            0,
        ).unwrap();
    } else {
        panic!("Need a valid Token Program ID");
    }

    let tx = Transaction::new_signed_with_payer(
        &[
            system_instruction::create_account(
                &context.payer.pubkey(),
                &mint.pubkey(),
                rent.minimum_balance(data_length),
                data_length as u64,
                token_program,
            ),
            init_ix,
        ],
        Some(&context.payer.pubkey()),
        &[&context.payer, mint],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await
}

pub async fn create_token(
    context: &mut ProgramTestContext,
    account: &Keypair,
    mint: &Pubkey,
    owner: &Pubkey,
    token_program: &Pubkey,
) -> Result<(), BanksClientError> {
    let rent = context.banks_client.get_rent().await.unwrap();

    let mut instructions: Vec<Instruction> = Vec::new();
    let data_length: usize;

    if *token_program == spl_token::id() {
        data_length = spl_token::state::Account::LEN;
        let init_ix = spl_token::instruction::initialize_account(
            &spl_token::id(),
            &account.pubkey(),
            mint,
            owner,
        )
        .unwrap();
        instructions.push(init_ix);
    } else if *token_program == spl_token_2022::id() {
        data_length =
            ExtensionType::try_calculate_account_len::<spl_token_2022::state::Account>(&[
                ExtensionType::ImmutableOwner,
            ])
            .unwrap();

        let init_immutable_owner_ix = spl_token_2022::instruction::initialize_immutable_owner(
            token_program,
            &account.pubkey(),
        )
        .unwrap();

        instructions.push(init_immutable_owner_ix);
        let init_ix = spl_token_2022::instruction::initialize_account(
            &spl_token_2022::id(),
            &account.pubkey(),
            mint,
            owner,
        )
        .unwrap();
        instructions.push(init_ix);
    } else {
        panic!("Need a valid Token Program ID");
    }

    instructions.insert(
        0,
        system_instruction::create_account(
            &context.payer.pubkey(),
            &account.pubkey(),
            rent.minimum_balance(data_length),
            data_length as u64,
            token_program,
        ),
    );

    let tx = Transaction::new_signed_with_payer(
        &instructions,
        Some(&context.payer.pubkey()),
        &[&context.payer, account],
        context.last_blockhash,
    );

    context.banks_client.process_transaction(tx).await
}

pub async fn get_token(
    context: &mut ProgramTestContext,
    pubkey: &Pubkey,
    token_program: &Pubkey,
) -> Result<ParsedTokenFields, ()> {
    let account = get_account(context, pubkey).await;
    let parsed_token: ParsedTokenFields;
    match *token_program {
        id if id == spl_token::id() => {
            let token = spl_token::state::Account::unpack(&account.data).unwrap();
            parsed_token = ParsedTokenFields {
                mint: token.mint,
                owner: token.owner,
            }
        }
        id if id == spl_token_2022::id() => {
            let token = spl_token_2022::extension::StateWithExtensions::<
                spl_token_2022::state::Account,
            >::unpack(&account.data)
            .unwrap();
            parsed_token = ParsedTokenFields {
                mint: token.base.mint,
                owner: token.base.owner,
            }
        }
        _ => return Err(()),
    }
    return Ok(parsed_token);
}
