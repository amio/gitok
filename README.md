# Gitok - Git Take Out

🚀 A fast CLI tool to clone specific parts of Git repositories using sparse-checkout. Supports both GitHub and GitLab.

## Installation

Install Gitok globally or use it with `npx`

```bash
# Use npx to run without installing globally
npx gitok <url>
# Install globally to use `gitok` command anywhere
npm install -g gitok
```

## Usage

### Basic Repository Clone

```bash
# Clone entire repository (GitHub)
gitok https://github.com/owner/repo

# Clone entire repository (GitLab)
gitok https://gitlab.com/owner/repo

# Clone specific folder from main branch (GitHub)
gitok https://github.com/owner/repo/tree/main/path/to/folder

# Clone specific folder from main branch (GitLab)
gitok https://gitlab.com/owner/repo/-/tree/main/path/to/folder

# Clone specific folder from different branch
gitok https://github.com/owner/repo/tree/develop/src/components
gitok https://gitlab.com/owner/repo/-/tree/develop/src/components
```

### Custom Output Directory

```bash
# Specify custom output directory name
gitok https://github.com/owner/repo/tree/main/examples -o my-examples
```

## Command Line Options

- `-o, --output <dir>` - Specify output directory name (default: repository name or folder name)
- `-h, --help` - Show help information
- `-V, --version` - Show version number

## Examples

```bash
# Clone React examples from a repository
gitok https://github.com/facebook/react/tree/main/packages/react-dom

# Clone specific documentation folder from GitHub
gitok https://github.com/microsoft/TypeScript/tree/main/doc

# Clone GitLab project documentation
gitok https://gitlab.com/gitlab-org/gitlab/-/tree/master/doc/api

# Clone with custom directory name
gitok https://github.com/vercel/next.js/tree/canary/examples/api-routes -o nextjs-api-example
```

## How It Works

1. **URL Parsing** - Extracts repository URL, branch, and subdirectory from GitHub or GitLab URLs
2. **Sparse Clone** - Uses `git clone --depth=1 --filter=blob:none --sparse` for efficient cloning
3. **Sparse Checkout** - Configures `git sparse-checkout` to only download specified directories
4. **Cleanup** - Removes `.git` directory to save space and create a clean copy

## Supported URL Formats

### GitHub
- `https://github.com/owner/repo` - Clone entire repository
- `https://github.com/owner/repo/tree/branch/path/to/folder` - Clone specific folder from specific branch

### GitLab
- `https://gitlab.com/owner/repo` - Clone entire repository
- `https://gitlab.com/owner/repo/-/tree/branch/path/to/folder` - Clone specific folder from specific branch
