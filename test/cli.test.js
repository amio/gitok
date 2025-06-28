import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCLI(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [path.join(__dirname, '../bin/gitok.js'), ...args]);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });
    child.on('close', (code) => { resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }); });
    child.on('error', reject);

    setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error('CLI command timed out'));
    }, 5000);
  });
}

test('CLI Tests', async (t) => {
  await t.test('should display help when run with --help', async () => {
    const result = await runCLI(['--help']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('gitok'));
    assert.ok(result.stdout.includes('Usage:'));
  });

  await t.test('should display version when run with --version', async () => {
    const result = await runCLI(['--version']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('1.0.0'));
  });

  await t.test('should show error for missing URL argument', async () => {
    const result = await runCLI([]);
    assert.notStrictEqual(result.code, 0);
    assert.ok(result.stderr.includes('error') || result.stdout.includes('required'));
  });

  await t.test('should show error for invalid GitHub URL', async () => {
    const result = await runCLI(['https://gitlab.com/owner/repo']);
    assert.notStrictEqual(result.code, 0);
    assert.ok(result.stderr.includes('Invalid GitHub URL format'));
  });
});
