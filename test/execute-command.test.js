import test from 'node:test';
import assert from 'node:assert';
import { executeCommand } from '../src/index.js';

test('executeCommand falls back without PTY', async () => {
  const previousValue = process.env.GITOK_DISABLE_PTY;
  process.env.GITOK_DISABLE_PTY = '1';

  try {
    const output = await executeCommand('printf "hello"');
    assert.ok(output.includes('hello'));
  } finally {
    if (previousValue === undefined) {
      delete process.env.GITOK_DISABLE_PTY;
    } else {
      process.env.GITOK_DISABLE_PTY = previousValue;
    }
  }
});

test('executeCommand fallback surfaces command errors', async () => {
  const previousValue = process.env.GITOK_DISABLE_PTY;
  process.env.GITOK_DISABLE_PTY = '1';

  try {
    await assert.rejects(() => executeCommand('exit 2'), /Exit code: 2/);
  } finally {
    if (previousValue === undefined) {
      delete process.env.GITOK_DISABLE_PTY;
    } else {
      process.env.GITOK_DISABLE_PTY = previousValue;
    }
  }
});
