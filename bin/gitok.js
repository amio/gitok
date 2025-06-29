#!/usr/bin/env node

import gitok from '../src/index.js';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

const program = new Command();

program
  .name('gitok')
  .description('A CLI tool to quickly clone specific parts of git repositories')
  .version(packageJson.version);

program.addHelpText('after', `
Examples:
  # Clone the entire repository
  $ gitok https://github.com/user/repo

  # Clone only a subdirectory from GitHub
  $ gitok https://github.com/user/repo/tree/main/path/to/subdir

  # Clone only a subdirectory from GitLab
  $ gitok https://gitlab.com/group/project/-/tree/master/path/to/subdir
`);

program
  .argument('<url>', 'Git repository URL (GitHub or GitLab)')
  .argument('[output]', 'Output directory name (optional)')
  .option('-b, --branch <branch>', 'Branch to clone from')
  .option('-v, --verbose', 'Show detailed output logs')
  .action(async (url, output, options) => {
    try {
      await gitok(url, {
        output,
        branch: options.branch,
        verbose: options.verbose,
      });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

if (process.argv.length <= 2) {
  program.help({ error: false });
}

program.parse();
