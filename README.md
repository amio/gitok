# `gitok` - the git take out

[![version][npm-badge]][npm-link] [![repo][github-src]][github-link]

A CLI to download specific parts of Git repositories using sparse-checkout. Supports GitHub and GitLab urls.

- 10x faster than `gitpick`
- Works with GitHub and GitLab urls

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
gitok https://github.com/owner/repo/tree/main/examples custom-directory
```
