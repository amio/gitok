#!/usr/bin/env node

const { program } = require('commander');
const gitik = require('../src/index.js');

program
  .name('gitik')
  .description('A CLI tool to quickly clone specific parts of git repositories')
  .version('1.0.0')
  .argument('<url>', 'GitHub repository URL (supports both repo root and specific folder paths)')
  .option('-o, --output <dir>', 'Output directory name (default: repository name)')
  .action(async (url, options) => {
    try {
      await gitik(url, options);
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();