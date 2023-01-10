import test from 'ava';
import { initializeCandyMachine } from '../src';

test('test example', (t) => {
  const foo = initializeCandyMachine;
  t.true(typeof foo === 'function');
});
