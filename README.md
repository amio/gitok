# Gitik

🚀 A fast CLI tool to clone specific parts of Git repositories using sparse-checkout.

## Features

- **Fast partial cloning** - Only downloads the files you need
- **Supports subdirectories** - Clone specific folders from repositories
- **Automatic cleanup** - Removes `.git` directory after cloning
- **Smart defaults** - Automatically detects repository and folder names
- **Branch support** - Works with any branch or tag

## Installation

### Global Installation (Recommended)

```bash
npm install -g gitik
```

### Local Installation

```bash
npm install gitik
npx gitik <url>
```

## Usage

### Basic Repository Clone

```bash
# Clone entire repository
gitik https://github.com/owner/repo
```

### Clone Specific Folder

```bash
# Clone specific folder from main branch
gitik https://github.com/owner/repo/tree/main/path/to/folder

# Clone specific folder from different branch
gitik https://github.com/owner/repo/tree/develop/src/components
```

### Custom Output Directory

```bash
# Specify custom output directory name
gitik https://github.com/owner/repo/tree/main/examples -o my-examples
```

## Command Line Options

- `-o, --output <dir>` - Specify output directory name (default: repository name or folder name)
- `-h, --help` - Show help information
- `-V, --version` - Show version number

## Examples

```bash
# Clone React examples from a repository
gitik https://github.com/facebook/react/tree/main/packages/react-dom

# Clone specific documentation folder
gitik https://github.com/microsoft/TypeScript/tree/main/doc

# Clone with custom directory name
gitik https://github.com/vercel/next.js/tree/canary/examples/api-routes -o nextjs-api-example
```

## How It Works

1. **URL Parsing** - Extracts repository URL, branch, and subdirectory from GitHub URL
2. **Sparse Clone** - Uses `git clone --depth=1 --filter=blob:none --sparse` for efficient cloning
3. **Sparse Checkout** - Configures `git sparse-checkout` to only download specified directories
4. **Cleanup** - Removes `.git` directory to save space and create a clean copy

## Supported URL Formats

- `https://github.com/owner/repo` - Clone entire repository
- `https://github.com/owner/repo/tree/branch/path/to/folder` - Clone specific folder from specific branch

## Requirements

- Node.js >= 14.0.0
- Git installed and available in PATH

## Error Handling

The tool includes comprehensive error handling for:
- Invalid URL formats
- Network connectivity issues
- Git command failures
- File system permissions
- Existing directory conflicts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Why Gitik?

Traditional `git clone` downloads the entire repository history and all files, which can be slow and wasteful when you only need specific parts. Gitik uses Git's sparse-checkout feature to:

- **Save bandwidth** - Only downloads necessary files
- **Save time** - Faster than full repository clones
- **Save space** - No `.git` history taking up disk space
- **Stay organized** - Clean directory structure without Git metadata

Perfect for:
- Downloading example projects
- Getting specific components or utilities
- Bootstrapping projects with templates
- Extracting documentation or specific folders