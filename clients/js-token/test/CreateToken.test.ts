import test from 'ava';
import { initializeToken } from '../src';

test('test example', (t) => {
  const foo = initializeToken;
  t.true(typeof foo === 'function');
});
