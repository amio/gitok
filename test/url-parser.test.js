import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source file and extract the parseGitUrl function for testing
import { readFileSync } from 'fs';
const sourceCode = readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');
const parseGitUrlMatch = sourceCode.match(/function parseGitUrl\(url\) \{[\s\S]*?\n\}/);

if (!parseGitUrlMatch) {
  throw new Error('Could not extract parseGitUrl function for testing');
}

// Create a test module with the extracted function
const parseGitUrlCode = parseGitUrlMatch[0];
const testModule = new Function('return (' + parseGitUrlCode.replace('function parseGitUrl', 'function') + ')')();

test('URL Parser Tests', async (t) => {
  await t.test('should parse basic GitHub repository URL', () => {
    const url = 'https://github.com/owner/repo';
    const result = testModule(url);

    assert.strictEqual(result.platform, 'github');
    assert.strictEqual(result.host, 'github.com');
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

    assert.strictEqual(result.platform, 'github');
    assert.strictEqual(result.host, 'github.com');
    assert.strictEqual(result.owner, 'sindresorhus');
    assert.strictEqual(result.repo, 'awesome');
    assert.strictEqual(result.branch, 'main');
    assert.strictEqual(result.subPath, 'media');
    assert.strictEqual(result.gitUrl, 'https://github.com/sindresorhus/awesome.git');
    assert.strictEqual(result.repoName, 'awesome');
  });

  await t.test('should parse GitHub repository URL with branch only', () => {
    const url = 'https://github.com/amio/gitok/tree/v1.1.0';
    const result = testModule(url);

    assert.strictEqual(result.platform, 'github');
    assert.strictEqual(result.host, 'github.com');
    assert.strictEqual(result.owner, 'amio');
    assert.strictEqual(result.repo, 'gitok');
    assert.strictEqual(result.branch, 'v1.1.0');
    assert.strictEqual(result.subPath, '');
    assert.strictEqual(result.gitUrl, 'https://github.com/amio/gitok.git');
    assert.strictEqual(result.repoName, 'gitok');
  });

  await t.test('should parse repository URL with .git extension', () => {
    const url = 'https://github.com/owner/repo.git';
    const result = testModule(url);

    assert.strictEqual(result.platform, 'github');
    assert.strictEqual(result.host, 'github.com');
    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.gitUrl, 'https://github.com/owner/repo.git');
  });

  await t.test('should parse basic GitLab repository URL', () => {
    const url = 'https://gitlab.com/owner/repo';
    const result = testModule(url);

    assert.strictEqual(result.platform, 'gitlab');
    assert.strictEqual(result.host, 'gitlab.com');
    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.branch, null);
    assert.strictEqual(result.subPath, '');
    assert.strictEqual(result.gitUrl, 'https://gitlab.com/owner/repo.git');
    assert.strictEqual(result.repoName, 'repo');
  });

  await t.test('should parse GitLab repository URL with branch and path', () => {
    const url = 'https://gitlab.com/gitlab-org/gitlab/-/tree/master/doc/api';
    const result = testModule(url);

    assert.strictEqual(result.platform, 'gitlab');
    assert.strictEqual(result.host, 'gitlab.com');
    assert.strictEqual(result.owner, 'gitlab-org');
    assert.strictEqual(result.repo, 'gitlab');
    assert.strictEqual(result.branch, 'master');
    assert.strictEqual(result.subPath, 'doc/api');
    assert.strictEqual(result.gitUrl, 'https://gitlab.com/gitlab-org/gitlab.git');
    assert.strictEqual(result.repoName, 'gitlab');
  });

  await t.test('should parse GitLab repository URL with .git extension', () => {
    const url = 'https://gitlab.com/owner/repo.git';
    const result = testModule(url);

    assert.strictEqual(result.platform, 'gitlab');
    assert.strictEqual(result.host, 'gitlab.com');
    assert.strictEqual(result.owner, 'owner');
    assert.strictEqual(result.repo, 'repo');
    assert.strictEqual(result.gitUrl, 'https://gitlab.com/owner/repo.git');
  });

  await t.test('should throw error for invalid Git URL', () => {
    const invalidUrls = ['https://bitbucket.org/owner/repo', 'https://github.com/owner', 'https://gitlab.com/owner', 'not-a-url'];
    invalidUrls.forEach(url => {
      assert.throws(() => testModule(url), /Invalid Git URL format/);
    });
  });
});
