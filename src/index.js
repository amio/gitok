import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Parse Git repository URL to extract repository info and subdirectory
 * Supports GitHub and GitLab URLs
 * @param {string} url - Git repository URL
 * @returns {object} - Parsed repository information
 */
function parseGitUrl(url) {
  // Handle null and undefined inputs
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid Git URL format. Expected: https://github.com/owner/repo, https://gitlab.com/owner/repo, or tree/blob URLs');
  }

  // Remove trailing slash and normalize URL
  url = url.trim().replace(/\/$/, '');

  // Check for query parameters or fragments which are not supported
  if (url.includes('?') || url.includes('#')) {
    throw new Error('Invalid Git URL format. URLs with query parameters or fragments are not supported');
  }

  // Detect platform and parse accordingly
  let platform, host, owner, repo, branch, subPath;

  // GitHub URL patterns
  const githubBasicMatch = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
  const githubTreeMatch = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/);

  // GitLab URL patterns
  const gitlabBasicMatch = url.match(/^https:\/\/gitlab\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
  const gitlabTreeMatch = url.match(/^https:\/\/gitlab\.com\/([^\/]+)\/([^\/]+)\/-\/tree\/([^\/]+)\/(.+)$/);

  if (githubBasicMatch) {
    platform = 'github';
    host = 'github.com';
    [, owner, repo, branch, subPath] = [githubBasicMatch[0], githubBasicMatch[1], githubBasicMatch[2], null, ''];
  } else if (githubTreeMatch) {
    platform = 'github';
    host = 'github.com';
    [, owner, repo, branch, subPath] = [githubTreeMatch[0], githubTreeMatch[1], githubTreeMatch[2], githubTreeMatch[3], githubTreeMatch[4]];
  } else if (gitlabBasicMatch) {
    platform = 'gitlab';
    host = 'gitlab.com';
    [, owner, repo, branch, subPath] = [gitlabBasicMatch[0], gitlabBasicMatch[1], gitlabBasicMatch[2], null, ''];
  } else if (gitlabTreeMatch) {
    platform = 'gitlab';
    host = 'gitlab.com';
    [, owner, repo, branch, subPath] = [gitlabTreeMatch[0], gitlabTreeMatch[1], gitlabTreeMatch[2], gitlabTreeMatch[3], gitlabTreeMatch[4]];
  } else {
    throw new Error('Invalid Git URL format. Expected: https://github.com/owner/repo, https://gitlab.com/owner/repo, or their respective tree/blob URLs');
  }

  // Remove .git suffix if present
  const repoName = repo.replace(/\.git$/, '');

  return {
    platform,
    host,
    owner,
    repo: repoName,
    branch: branch || null,
    subPath: subPath || '',
    gitUrl: `https://${host}/${owner}/${repoName}.git`,
    repoName
  };
}

/**
 * Execute shell command with TTY support for progress display
 * @param {string} command - Command to execute
 * @param {object} options - Command execution options
 * @param {string} options.cwd - Working directory
 * @param {function} options.outputTransform - Function to transform/filter output data
 * @returns {Promise<string>} - Command output
 */
async function executeCommand(command, options = {}) {
  return new Promise(async (resolve, reject) => {
    const { cwd = process.cwd(), outputTransform } = options;

    try {
      const pty = await import('node-pty');

      const ptyProcess = pty.spawn('sh', ['-c', command], {
        name: 'xterm-color',
        cols: process.stdout.columns || 80,
        rows: process.stdout.rows || 24,
        cwd: cwd,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
          FORCE_COLOR: '1'
        }
      });

      let output = '';

      ptyProcess.onData((data) => {
        output += data;

        // If transform function is provided, process the data
        const processedData = outputTransform ? outputTransform(data) : data;

        // Only output if the result is not null/undefined
        if (processedData != null) {
          process.stdout.write(processedData);
        }
      });

      ptyProcess.onExit(({ exitCode, signal }) => {
        if (exitCode === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${command}\nExit code: ${exitCode}\nSignal: ${signal}`));
        }
      });

    } catch (error) {
      reject(new Error(`node-pty is required but not available: ${error.message}`));
    }
  });
}

/**
 * Check if directory exists
 * @param {string} dirPath - Directory path
 * @returns {Promise<boolean>} - Whether directory exists
 */
async function directoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Remove directory recursively
 * @param {string} dirPath - Directory path to remove
 */
async function removeDirectory(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Warning: Could not remove directory ${dirPath}:`, error.message);
  }
}

/**
 * Main gitok function
 * @param {string} url - GitHub URL
 * @param {object} options - CLI options
 */
async function gitok(url, options = {}) {
  const { platform, host, owner, repo, branch, subPath, gitUrl, repoName } = parseGitUrl(url);

  // Determine output directory
  const outputDir = options.output || (subPath ? path.basename(subPath) : repoName);

  // Use ANSI escape codes for color: cyan for repo, orange for branch, green for path
  // Orange: \x1b[38;5;208m (256-color), Cyan: \x1b[36m, Green: \x1b[32m, Dim: \x1b[2m, Reset: \x1b[0m
  // Light blue: \x1b[94m
  let info = `\x1b[2mrepo:\x1b[0m\x1b[94m${owner}/${repo}\x1b[0m`;
  if (branch) info += ` \x1b[2mbranch:\x1b[0m\x1b[38;5;208m${branch}\x1b[0m`;
  if (subPath) info += ` \x1b[2mpath:\x1b[0m\x1b[32m${subPath}\x1b[0m`;
  info += ` -> \x1b[36m./${outputDir}\x1b[0m`;
  console.log(info);

  // Check if output directory already exists
  if (await directoryExists(outputDir)) {
    throw new Error(`Directory '${outputDir}' already exists. Please choose a different output directory or remove the existing one.`);
  }

  const outputTransform = (data) => {
    // Filter out lines starting with "remote: "
    return data.split('\n').filter(line => !line.startsWith('remote: ')).join('\n');
  }

  try {
    // Step 1: Clone with sparse-checkout
    const branchParam = branch ? ` -b "${branch}"` : '';
    const cloneCommand = `git clone --depth=1 --filter=blob:none --sparse --single-branch --no-tags ${branchParam} "${gitUrl}" "${outputDir}"`;
    await executeCommand(cloneCommand, { outputTransform });

    // Step 2: If subPath is not specified, retrieve all files; otherwise, set up sparse-checkout for the specified subPath
    if (!subPath) {
      await executeCommand('git sparse-checkout disable', { cwd: outputDir });
    } else {
      console.log('Configuring sparse-checkout...');

      await executeCommand('git sparse-checkout init --cone', { cwd: outputDir });
      await executeCommand(`git sparse-checkout set "${subPath}"`, { cwd: outputDir, outputTransform });

      // Check if we should move contents up (when cloning subdirectory only)
      const subDirPath = path.join(outputDir, subPath);

      if (await directoryExists(subDirPath)) {
        // console.log('Extracting subdirectory...');

        // Create a temporary directory name
        const tempDir = `${outputDir}_temp_${Date.now()}`;

        // Rename current output directory to temporary name
        await fs.rename(outputDir, tempDir);

        // Move the subdirectory to the original output location
        const tempSubDirPath = path.join(tempDir, subPath);
        await fs.rename(tempSubDirPath, outputDir);

        // Remove the temporary directory (includes .git cleanup)
        await removeDirectory(tempDir);
      }
    }

    // Step 3: Clean up .git directory
    const gitDir = path.join(outputDir, '.git');
    if (await directoryExists(gitDir)) {
      await removeDirectory(gitDir);
    }

    console.log(`Done: ${path.resolve(outputDir)}`);

  } catch (error) {
    // Clean up on error
    if (await directoryExists(outputDir)) {
      await removeDirectory(outputDir);
    }
    throw error;
  }
}

export default gitok;
