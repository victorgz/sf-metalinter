# Development Workflow

This project uses **trunk-based development** for simplicity and speed.

## 🌟 Simple Workflow

### Daily Development

```bash
# All changes go through PRs (no direct commits to main)
git checkout main
git pull origin main
git checkout -b feature/new-feature

# Make your changes
git add .
git commit -m "feat: implement new feature"
git push origin feature/new-feature

# Create PR to main → CI runs → Merge after approval
```

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Breaking changes:** Add `!` after type or add `BREAKING CHANGE:` in footer (major version bump)

## 🚀 Automated Pipeline

### CI (runs on every PR to main)

- ✅ Lint & Format check
- ✅ Build validation
- ✅ Unit tests
- ✅ Installation compatibility test

### Release (manual trigger only)

- 🔄 Automatically determines version bump from commit messages
- 📦 Updates `package.json` version
- 📝 Generates `CHANGELOG.md`
- 🏷️ Creates Git tag
- 📋 Creates GitHub release
- 🚀 Publishes to npm

## 🔧 Local Development

```bash
# Setup
yarn install

# Development
yarn build      # Compile TypeScript
yarn test       # Run tests
yarn lint       # Check code style
yarn format     # Fix formatting

# Testing your changes
yarn link       # Link locally
sf metalinter lint --help  # Test your plugin
```

## 📋 Release Process

**Manual but automated!** When you're ready to release:

1. **Go to GitHub Actions** → **Release** workflow
2. **Click "Run workflow"**
3. **🎉 Release happens automatically!**

The workflow will:

- Analyze all commits since last release
- Determine version bump (patch/minor/major)
- Update package.json, create changelog, tag, and publish

## 🏃‍♂️ Quick Tips

1. **Small PRs**: Keep PRs focused and small for quick reviews
2. **Clear messages**: Use conventional commit format
3. **Fast merges**: Review and merge PRs quickly
4. **Trust the pipeline**: CI validates everything before merge
5. **Manual releases**: Release when you're ready, not automatically
6. **Stay current**: Pull main frequently

## 🆘 Emergency Hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug
# Fix the bug
git commit -m "fix: resolve critical issue"
git push origin hotfix/critical-bug
# Create PR, merge immediately
```

The automated pipeline will handle the rest! 🚀
