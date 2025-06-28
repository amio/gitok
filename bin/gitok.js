#!/usr/bin/env node

import { program } from 'commander';
import gitok from '../src/index.js';

program
  .name('gitok')
  .description('A CLI tool to quickly clone specific parts of git repositories')
  .version('1.0.0')
  .argument('<url>', 'Git repository URL (supports GitHub and GitLab, both repo root and specific folder paths)')
  .option('-o, --output <dir>', 'Output directory name (default: repository name)')
  .action(async (url, options) => {
    try {
      await gitok(url, options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
