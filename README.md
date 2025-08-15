# Gemini CLI Updater

A command-line tool that automatically manages and updates Gemini CLI installations with wrapper functionality.

## Overview

Gemini CLI Updater solves the problem of manual Gemini CLI updates by automatically checking for and installing updates before each execution. It provides seamless auto-update functionality with cross-platform support and shell integration.

## Features

- ✅ **Auto-update Gemini CLI** on each execution
- ✅ **Cross-platform support** (macOS, Linux, Windows)
- ✅ **Automatic shell alias configuration** (bash, zsh, fish, PowerShell)
- ✅ **Smart update caching** to avoid delays (1-hour cooldown)
- ✅ **Version tracking and rollback** capabilities
- ✅ **Clean installation and uninstallation**
- ✅ **Error handling and logging**
- ✅ **Zero-configuration** after installation

## Installation

### Via npm (Recommended)

```bash
npm install -g gemini-cli-updater
```

The installation will automatically:
- Set up shell aliases for seamless integration
- Create configuration directories
- Initialize logging

### Manual Installation

```bash
git clone https://github.com/0xRaghu/gemini-cli-updater.git
cd gemini-cli-updater
npm install
npm link
```

## Usage

After installation, simply use `gemini` as you normally would:

```bash
# Auto-updates and runs Gemini CLI
gemini

# Pass any arguments to Gemini
gemini --help
gemini "Hello, world!"

# Skip update check for faster startup
gemini --skip-update "Quick command"
```

## How It Works

1. **Update Check**: When you run `gemini`, it first checks for Gemini CLI updates
2. **Smart Caching**: Updates are checked at most once per hour to avoid delays
3. **Auto-Update**: If an update is available, it's installed automatically
4. **Execution**: Your original command is passed through to the actual Gemini CLI

## Configuration

### Config File Location

- **macOS/Linux**: `~/.gemini-cli-updater/config.json`
- **Windows**: `%USERPROFILE%\.gemini-cli-updater\config.json`

### Settings

```json
{
  "settings": {
    "updateCooldown": 3600000,
    "maxVersionHistory": 10,
    "enableLogging": true,
    "autoUpdate": true
  }
}
```

### Environment Variables

- `GEMINI_UPDATER_DEBUG=true` - Enable debug logging
- `GEMINI_UPDATER_SKIP_UPDATE=true` - Skip all update checks

## Shell Integration

The installer automatically adds aliases to your shell configuration:

### Bash/Zsh
```bash
alias gemini='gemini-cli-updater'
```

### Fish
```fish
alias gemini 'gemini-cli-updater'
```

### PowerShell
```powershell
function gemini { & gemini-cli-updater $args }
```

## Commands

### Main Command
```bash
gemini [arguments]  # Auto-update and run Gemini CLI
```

### Utility Commands
```bash
# Installation validation
npx gemini-cli-updater-install --validate

# Repair installation
npx gemini-cli-updater-install --repair

# Uninstall (preserve user data)
npm uninstall -g gemini-cli-updater

# Complete removal including user data
npx gemini-cli-updater-uninstall --clean
```

## Version Management

### Rollback to Previous Version
```javascript
const Updater = require('gemini-cli-updater/lib/updater');
const updater = new Updater('@google/gemini-cli', 'gemini');
await updater.rollbackToPreviousVersion();
```

### Force Update
```bash
# Force update regardless of cooldown
GEMINI_UPDATER_DEBUG=true gemini --force-update
```

## Troubleshooting

### Common Issues

**1. Gemini not found after installation**
```bash
# Check if Gemini CLI is installed
gemini --version

# Install Gemini CLI if missing
npm install -g @google/gemini-cli
```

**2. Shell alias not working**
```bash
# Restart terminal or reload shell config
source ~/.zshrc  # or ~/.bashrc
```

**3. Permission errors**
```bash
# Fix npm permissions (Unix-like systems)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Debug Mode

Enable debug logging to troubleshoot issues:

```bash
export GEMINI_UPDATER_DEBUG=true
gemini --help
```

### Log Files

Check log files for detailed information:

```bash
# View recent logs
tail -f ~/.gemini-cli-updater/updater.log

# Clear logs
rm ~/.gemini-cli-updater/updater.log
```

### Manual Shell Setup

If automatic shell integration fails, add this alias manually:

```bash
# Add to ~/.zshrc, ~/.bashrc, or equivalent
alias gemini='gemini-cli-updater'
```

## Uninstallation

### Method 1: Standard Uninstall (Recommended)
```bash
npm uninstall -g gemini-cli-updater
```
This automatically removes:
- ✅ The npm package
- ✅ Shell aliases 
- ✅ Binary files (wrapper only, preserves real @google/gemini-cli)
- ⚠️ Preserves user data (`~/.gemini-cli-updater/`)

### Method 2: Complete Cleanup (If Standard Fails)
If the standard uninstall doesn't work completely, use our cleanup script:

```bash
# Download and run the cleanup script
curl -L https://raw.githubusercontent.com/0xRaghu/gemini-cli-updater/main/scripts/cleanup.js -o cleanup.js
node cleanup.js --clean

# Or if you have the package locally
npx gemini-cli-updater --cleanup --clean
```

### Method 3: Manual Cleanup
If both methods fail, manual cleanup:

```bash
# 1. Force remove npm package
npm uninstall -g gemini-cli-updater --force

# 2. Remove wrapper binary files (preserve real @google/gemini-cli)
# Check if ~/.nvm/versions/node/*/bin/gemini contains "gemini-cli-updater" and remove
rm -f ~/.nvm/versions/node/*/bin/gemini-cli-updater

# 3. Remove shell aliases
# Edit ~/.bashrc, ~/.bash_profile, ~/.zshrc
# Remove lines containing "gemini-cli-updater" or "alias gemini="

# 4. Remove user data (optional)
rm -rf ~/.gemini-cli-updater

# 5. Restart terminal
```

**Important**: The real `@google/gemini-cli` package will be preserved during cleanup.

### Verification
After uninstallation, verify removal:
```bash
# Should show @google/gemini-cli version (not wrapper output)
gemini --version

# Should not list the wrapper package
npm list -g gemini-cli-updater

# Should still show the real Gemini CLI
npm list -g @google/gemini-cli
```

## Development

### Setup Development Environment
```bash
git clone https://github.com/0xRaghu/gemini-cli-updater.git
cd gemini-cli-updater
npm install
npm link
```

### Run Tests
```bash
npm test
```

### Debug Local Installation
```bash
GEMINI_UPDATER_DEBUG=true node bin/gemini-cli-updater.js --help
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0
- Internet connection for updates

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/0xRaghu/gemini-cli-updater/issues)
- **Documentation**: [GitHub Wiki](https://github.com/0xRaghu/gemini-cli-updater/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/0xRaghu/gemini-cli-updater/discussions)

## Related Projects

- [Gemini CLI](https://github.com/google/gemini-cli) - The official Gemini CLI
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates) - Update package dependencies

---

**Note**: This tool is an unofficial wrapper for the Gemini CLI and is not affiliated with Google.