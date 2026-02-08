# `gitok` - git take out

[![version][npm-badge]][npm-link] [![repo][github-src]][github-link]

A CLI to download specific parts of Git repositories using sparse-checkout.

- 10x faster than `gitpick`
- Supports GitHub and GitLab urls.

[github-src]: https://badgen.net/badge/-/amio%2Fgitok/black?icon=github&label=
[github-link]: https://github.com/amio/gitok
[npm-badge]: https://badgen.net/npm/v/gitok
[npm-link]: https://www.npmjs.com/package/gitok

## Installation

```bash
# Install globally to use `gitok` command anywhere
npm install -g gitok

# Use npx to run without installing globally
npx gitok <url>
```

## Usage

### Basic Repository Clone

```bash
  # Clone entire repository (GitHub/GitLab)
  gitok https://github.com/owner/repo
  gitok https://gitlab.com/owner/repo

  # Clone entire repository from a specific branch (GitHub)
  gitok https://github.com/owner/repo/tree/v1.1.0

# Clone specific folder from main branch (GitHub/GitLab)
gitok https://github.com/owner/repo/tree/main/path/to/folder
gitok https://gitlab.com/owner/repo/-/tree/main/path/to/folder

# Clone specific folder from different branch
gitok https://github.com/owner/repo/tree/develop/src/components
gitok https://gitlab.com/owner/repo/-/tree/develop/src/components
```

### Full Help

```bash
Usage: gitok [options] <url> [output]

A CLI tool to quickly clone specific parts of git repositories

Arguments:
  url                    Git repository URL (GitHub or GitLab)
  output                 Output directory name (optional)

Options:
  -V, --version          output the version number
  -b, --branch <branch>  Branch to clone from
  -v, --verbose          Show detailed output logs
  -h, --help             display help for command

Examples:
  # Clone the entire repository
  $ gitok https://github.com/user/repo

  # Clone only a subdirectory from GitHub
  $ gitok https://github.com/user/repo/tree/main/path/to/subdir

  # Clone only a subdirectory from GitLab
  $ gitok https://gitlab.com/group/project/-/tree/master/path/to/subdir
```

## License

MIT License © 2025 Amio
