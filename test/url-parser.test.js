import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source file and extract the parseGitHubUrl function for testing
import { readFileSync } from 'fs';
const sourceCode = readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');
const parseGitHubUrlMatch = sourceCode.match(/function parseGitHubUrl\(url\) \{[\s\S]*?\n\}/);

if (!parseGitHubUrlMatch) {
  throw new Error('Could not extract parseGitHubUrl function for testing');
}

// Create a test module with the extracted function
const parseGitHubUrlCode = parseGitHubUrlMatch[0];
const testModule = new Function('return (' + parseGitHubUrlCode.replace('function parseGitHubUrl', 'function') + ')')();

test('URL Parser Tests', async (t) => {
  await t.test('should parse basic GitHub repository URL', () => {
    const url = 'https://github.com/owner/repo';
    const result = testModule(url);

    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.branch, null);
    assert.strictEqual(result.subPath, '');
    assert.strictEqual(result.gitUrl, 'https://github.com/owner/repo.git');
    assert.strictEqual(result.repoName, 'repo');
  });

  await t.test('should parse GitHub repository URL with branch and path', () => {
    const url = 'https://github.com/sindresorhus/awesome/tree/main/media';
    const result = testModule(url);

    assert.strictEqual(result.owner, 'sindresorhus');
    assert.strictEqual(result.repo, 'awesome');
    assert.strictEqual(result.branch, 'main');
    assert.strictEqual(result.subPath, 'media');
    assert.strictEqual(result.gitUrl, 'https://github.com/sindresorhus/awesome.git');
    assert.strictEqual(result.repoName, 'awesome');
  });

  await t.test('should parse repository URL with .git extension', () => {
    const url = 'https://github.com/owner/repo.git';
    const result = testModule(url);

    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.gitUrl, 'https://github.com/owner/repo.git');
  });

  await t.test('should throw error for invalid GitHub URL', () => {
    const invalidUrls = ['https://gitlab.com/owner/repo', 'https://github.com/owner', 'not-a-url'];
    invalidUrls.forEach(url => {
      assert.throws(() => testModule(url), /Invalid GitHub URL format/);
    });
  });
});
