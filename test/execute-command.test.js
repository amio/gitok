import test from 'node:test';
import assert from 'node:assert';
import { executeCommand } from '../src/index.js';

test('executeCommand captures output', async () => {
  const output = await executeCommand('printf "hello"');
  assert.ok(output.includes('hello'));
});

test('executeCommand surfaces command errors', async () => {
  await assert.rejects(() => executeCommand('exit 2'), /Exit code: 2/);
});
