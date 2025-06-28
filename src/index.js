import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Parse GitHub URL to extract repository info and subdirectory
 * @param {string} url - GitHub URL
 * @returns {object} - Parsed repository information
 */
function parseGitHubUrl(url) {
  // Handle null and undefined inputs
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo or https://github.com/owner/repo/tree/branch/path');
  }

  // Remove trailing slash and normalize URL
  url = url.trim().replace(/\/$/, '');

  // Check for query parameters or fragments which are not supported
  if (url.includes('?') || url.includes('#')) {
    throw new Error('Invalid GitHub URL format. URLs with query parameters or fragments are not supported');
  }

  // Match GitHub URL patterns - only accept basic repo URLs or tree URLs
  const basicRepoMatch = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/);
  const treeRepoMatch = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/);
  
  let repoMatch;
  if (basicRepoMatch) {
    repoMatch = [basicRepoMatch[0], basicRepoMatch[1], basicRepoMatch[2], null, ''];
  } else if (treeRepoMatch) {
    repoMatch = [treeRepoMatch[0], treeRepoMatch[1], treeRepoMatch[2], treeRepoMatch[3], treeRepoMatch[4]];
  } else {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo or https://github.com/owner/repo/tree/branch/path');
  }

  const [, owner, repo, branch, subPath] = repoMatch;

  // Remove .git suffix if present
  const repoName = repo.replace(/\.git$/, '');

  return {
    owner,
    repo: repoName,
    branch: branch || null,
    subPath: subPath || '',
    gitUrl: `https://github.com/${owner}/${repoName}.git`,
    repoName
  };
}

/**
 * Execute shell command with better error handling
 * @param {string} command - Command to execute
 * @param {string} cwd - Working directory
 * @returns {Promise<string>} - Command output
 */
async function executeCommand(command, cwd = process.cwd()) {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stdout && stdout.trim()) {
      console.log(stdout.trim());
    }
    if (stderr && stderr.trim()) {
      console.log(stderr.trim());
    }
    return stdout;
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
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
 * Main gitik function
 * @param {string} url - GitHub URL
 * @param {object} options - CLI options
 */
async function gitik(url, options = {}) {
  const { owner, repo, branch, subPath, gitUrl, repoName } = parseGitHubUrl(url);

  console.log(`Repository: ${owner}/${repo}`);
  if (branch) {
    console.log(`Branch: ${branch}`);
  }
  if (subPath) {
    console.log(`Path: ${subPath}`);
  }

  // Determine output directory
  const outputDir = options.output || (subPath ? path.basename(subPath) : repoName);

  // Check if output directory already exists
  if (await directoryExists(outputDir)) {
    throw new Error(`Directory '${outputDir}' already exists. Please choose a different output directory or remove the existing one.`);
  }

  try {
    // Step 1: Clone with sparse-checkout
    console.log('Cloning...');
    await executeCommand(`git clone --depth=1 --filter=blob:none --sparse "${gitUrl}" "${outputDir}"`);

    // Step 2: Configure sparse-checkout if subPath is specified
    if (subPath) {
      console.log('Configuring sparse-checkout...');

      // Initialize sparse-checkout
      await executeCommand('git sparse-checkout init --cone', outputDir);

      // Set the specific path
      await executeCommand(`git sparse-checkout set "${subPath}"`, outputDir);

      // Check if we should move contents up (when cloning subdirectory only)
      const subDirPath = path.join(outputDir, subPath);
      if (await directoryExists(subDirPath)) {
        console.log('Extracting subdirectory...');

        // Get list of files in subdirectory
        const subDirContents = await fs.readdir(subDirPath);

        // Move each item from subdirectory to parent
        for (const item of subDirContents) {
          const sourcePath = path.join(subDirPath, item);
          const targetPath = path.join(outputDir, item);
          await fs.rename(sourcePath, targetPath);
        }

        // Remove empty subdirectory structure
        const pathParts = subPath.split('/');
        let currentPath = outputDir;
        for (const part of pathParts) {
          currentPath = path.join(currentPath, part);
          try {
            await fs.rmdir(currentPath);
          } catch {
            // Directory not empty or doesn't exist, continue
            break;
          }
        }

        // Clean up any remaining root files that aren't part of the subdirectory
        const rootContents = await fs.readdir(outputDir);
        for (const item of rootContents) {
          const itemPath = path.join(outputDir, item);
          const stat = await fs.stat(itemPath);

          // Remove root-level files that are not from our target subdirectory
          if (stat.isFile() && !subDirContents.includes(item)) {
            await fs.unlink(itemPath);
          }
        }
      }
    } else {
      // If no subPath, get all files
      await executeCommand('git sparse-checkout disable', outputDir);
    }

    // Step 3: Ensure we're on the correct branch
    if (branch) {
      try {
        await executeCommand(`git checkout ${branch}`, outputDir);
      } catch (error) {
        console.warn(`Warning: Could not switch to branch '${branch}', staying on default branch`);
      }
    }

    // Step 4: Clean up .git directory
    const gitDir = path.join(outputDir, '.git');
    await removeDirectory(gitDir);

    console.log(`Done: ${path.resolve(outputDir)}`);

  } catch (error) {
    // Clean up on error
    if (await directoryExists(outputDir)) {
      await removeDirectory(outputDir);
    }
    throw error;
  }
}

export default gitik;
