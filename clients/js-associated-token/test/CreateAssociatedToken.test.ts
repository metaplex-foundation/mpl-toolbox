import test from 'ava';
import { create } from '../src';

test('test example', (t) => {
  const foo = create;
  t.true(typeof foo === 'function');
});
