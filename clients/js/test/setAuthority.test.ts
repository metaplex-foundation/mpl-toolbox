import {
  generateSigner,
  none,
  PublicKey,
  some,
} from '@metaplex-foundation/umi';
import test from 'ava';
import { AuthorityType, fetchToken, setAuthority } from '../src';
import { createMintAndToken, createUmi } from './_setup';

test('it can set the close authority of a token account', async (t) => {
  // Given a token account with no close authority.
  const umi = await createUmi();
  const owner = generateSigner(umi);
  const [, token] = await createMintAndToken(umi, { owner: owner.publicKey });
  let tokenAccount = await fetchToken(umi, token.publicKey);
  t.deepEqual(tokenAccount.closeAuthority, none<PublicKey>());

  // When the owner sets the close authority on the token account.
  const newCloseAuthority = generateSigner(umi);
  await setAuthority(umi, {
    owned: token.publicKey,
    owner,
    authorityType: AuthorityType.CloseAccount,
    newAuthority: some(newCloseAuthority.publicKey),
  }).sendAndConfirm(umi);

  // Then the new close authority was successfully set.
  tokenAccount = await fetchToken(umi, token.publicKey);
  t.deepEqual(tokenAccount.closeAuthority, some(newCloseAuthority.publicKey));
});

test('it can clear the close authority of a token account', async (t) => {
  // Given a token account with a close authority.
  const umi = await createUmi();
  const owner = generateSigner(umi);
  const [, token] = await createMintAndToken(umi, { owner: owner.publicKey });
  const closeAuthority = generateSigner(umi);
  await setAuthority(umi, {
    owned: token.publicKey,
    owner,
    authorityType: AuthorityType.CloseAccount,
    newAuthority: some(closeAuthority.publicKey),
  }).sendAndConfirm(umi);
  let tokenAccount = await fetchToken(umi, token.publicKey);
  t.deepEqual(tokenAccount.closeAuthority, some(closeAuthority.publicKey));

  // When the close authority clears itself on the token account.
  await setAuthority(umi, {
    owned: token.publicKey,
    owner: closeAuthority,
    authorityType: AuthorityType.CloseAccount,
    newAuthority: none(),
  }).sendAndConfirm(umi);

  // Then the new close authority was successfully cleared.
  tokenAccount = await fetchToken(umi, token.publicKey);
  t.deepEqual(tokenAccount.closeAuthority, none<PublicKey>());
});
