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

program
  .argument('<url>', 'Git repository URL (GitHub or GitLab)')
  .argument('[output]', 'Output directory name (optional)')
  .option('-b, --branch <branch>', 'Branch to clone from')
  .action(async (url, output, options) => {
    try {
      await gitok(url, {
        output,
        branch: options.branch
      });
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
