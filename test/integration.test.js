import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import gitok from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Integration Tests', async (t) => {
  let tempDir;
  let originalCwd;

  t.beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(__dirname, 'temp-integration-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
  });

  t.afterEach(async () => {
    process.chdir(originalCwd);
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  await t.test('should successfully clone awesome media subdirectory', async () => {
    const url = 'https://github.com/sindresorhus/awesome/tree/main/media';

    await gitok(url);

    const outputDir = 'media';
    const stat = await fs.stat(outputDir);
    assert.ok(stat.isDirectory(), 'media directory should be created');

    const files = await fs.readdir(outputDir);
    assert.ok(files.length > 0, 'media directory should contain files');

    // Verify .git directory was removed
    const gitDir = path.join(outputDir, '.git');
    await assert.rejects(fs.stat(gitDir), { code: 'ENOENT' });
  });

  await t.test('should use custom output directory name', async () => {
    const url = 'https://github.com/sindresorhus/awesome/tree/main/media';
    const customOutput = 'my-media';

    await gitok(url, { output: customOutput });

    const stat = await fs.stat(customOutput);
    assert.ok(stat.isDirectory(), 'Custom output directory should be created');

    const files = await fs.readdir(customOutput);
    assert.ok(files.length > 0, 'Custom directory should contain files');
  });

  await t.test('should reject when output directory already exists', async () => {
    const conflictDir = 'test-repo';
    await fs.mkdir(conflictDir);

    await assert.rejects(
      gitok('https://github.com/owner/test-repo'),
      /Directory 'test-repo' already exists/
    );
  });
});
