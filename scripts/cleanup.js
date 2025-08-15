#!/usr/bin/env node

/**
 * Complete cleanup script for gemini-cli-updater
 * This script ensures complete removal of all traces of the package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class CompleteCleanup {
  constructor() {
    this.homeDir = require('os').homedir();
    this.platform = require('os').platform();
  }

  async cleanup() {
    console.log(chalk.blue('🧹 Starting complete gemini-cli-updater cleanup...'));
    
    try {
      // Step 1: Try normal npm uninstall first
      await this.npmUninstall();
      
      // Step 2: Remove any leftover binary files
      await this.removeBinaries();
      
      // Step 3: Remove shell aliases
      await this.removeAliases();
      
      // Step 4: Remove user data (with confirmation)
      await this.removeUserData();
      
      // Step 5: Verify cleanup
      await this.verifyCleanup();
      
      console.log(chalk.green('\n✅ Complete cleanup successful!'));
      console.log(chalk.cyan('Please restart your terminal to complete the removal.'));
      
    } catch (error) {
      console.error(chalk.red('❌ Cleanup failed:'), error.message);
      console.log(chalk.yellow('\nTrying manual cleanup...'));
      await this.manualCleanup();
    }
  }

  async npmUninstall() {
    console.log(chalk.blue('📦 Attempting npm uninstall...'));
    
    try {
      execSync('npm uninstall -g gemini-cli-updater', { stdio: 'inherit' });
      console.log(chalk.green('✅ npm uninstall completed'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  npm uninstall failed, continuing with manual cleanup...'));
    }
  }

  async removeBinaries() {
    console.log(chalk.blue('🗑️  Removing binary files...'));
    
    const possiblePaths = [
      // Node.js global bin paths
      path.join(this.homeDir, '.nvm/versions/node/*/bin/gemini'),
      path.join(this.homeDir, '.nvm/versions/node/*/bin/gemini-cli-updater'),
      // npm global paths
      '/usr/local/bin/gemini',
      '/usr/local/bin/gemini-cli-updater',
      // Windows paths
      path.join(this.homeDir, 'AppData/Roaming/npm/gemini.cmd'),
      path.join(this.homeDir, 'AppData/Roaming/npm/gemini-cli-updater.cmd'),
    ];

    for (const binaryPath of possiblePaths) {
      if (binaryPath.includes('*')) {
        // Handle glob patterns for nvm paths
        try {
          const basePath = binaryPath.split('*')[0];
          if (fs.existsSync(basePath)) {
            const versions = fs.readdirSync(basePath);
            for (const version of versions) {
              const fullPath = binaryPath.replace('*', version);
              if (fs.existsSync(fullPath)) {
                // Only remove if it's our wrapper, not the real gemini CLI
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('gemini-cli-updater') || content.includes('GeminiUpdaterCLI')) {
                  fs.unlinkSync(fullPath);
                  console.log(chalk.green(`✅ Removed wrapper: ${fullPath}`));
                }
              }
            }
          }
        } catch (error) {
          // Ignore errors for non-existent paths
        }
      } else {
        if (fs.existsSync(binaryPath)) {
          try {
            // Only remove if it's our wrapper, not the real gemini CLI
            const content = fs.readFileSync(binaryPath, 'utf8');
            if (content.includes('gemini-cli-updater') || content.includes('GeminiUpdaterCLI')) {
              fs.unlinkSync(binaryPath);
              console.log(chalk.green(`✅ Removed wrapper: ${binaryPath}`));
            }
          } catch (error) {
            console.log(chalk.yellow(`⚠️  Could not remove: ${binaryPath} (${error.message})`));
          }
        }
      }
    }
  }

  async removeAliases() {
    console.log(chalk.blue('🔧 Removing shell aliases...'));
    
    const shellFiles = [
      path.join(this.homeDir, '.bashrc'),
      path.join(this.homeDir, '.bash_profile'),
      path.join(this.homeDir, '.zshrc'),
      path.join(this.homeDir, '.config/fish/config.fish'),
    ];

    for (const shellFile of shellFiles) {
      if (fs.existsSync(shellFile)) {
        try {
          let content = fs.readFileSync(shellFile, 'utf8');
          const lines = content.split('\n');
          
          // Remove gemini-cli-updater related lines
          const filteredLines = lines.filter(line => {
            return !line.includes('gemini-cli-updater') &&
                   !line.includes("alias gemini=") &&
                   !(line.includes('# Added by gemini-cli-updater'));
          });
          
          if (filteredLines.length !== lines.length) {
            fs.writeFileSync(shellFile, filteredLines.join('\n'));
            console.log(chalk.green(`✅ Cleaned aliases from: ${shellFile}`));
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Could not clean: ${shellFile} (${error.message})`));
        }
      }
    }

    // Handle PowerShell on Windows
    if (this.platform === 'win32') {
      try {
        const profilePaths = [
          path.join(this.homeDir, 'Documents/PowerShell/profile.ps1'),
          path.join(this.homeDir, 'Documents/WindowsPowerShell/profile.ps1')
        ];
        
        for (const profilePath of profilePaths) {
          if (fs.existsSync(profilePath)) {
            let content = fs.readFileSync(profilePath, 'utf8');
            if (content.includes('gemini-cli-updater')) {
              content = content.replace(/function gemini.*\r?\n/g, '');
              content = content.replace(/# Added by gemini-cli-updater.*\r?\n/g, '');
              fs.writeFileSync(profilePath, content);
              console.log(chalk.green(`✅ Cleaned PowerShell profile: ${profilePath}`));
            }
          }
        }
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Could not clean PowerShell profile: ${error.message}`));
      }
    }
  }

  async removeUserData() {
    console.log(chalk.blue('📁 Checking user data...'));
    
    const configDir = path.join(this.homeDir, '.gemini-cli-updater');
    
    if (fs.existsSync(configDir)) {
      const shouldRemove = process.argv.includes('--clean') || 
                          process.argv.includes('--purge') ||
                          process.argv.includes('--force');
      
      if (shouldRemove) {
        try {
          fs.rmSync(configDir, { recursive: true, force: true });
          console.log(chalk.green('✅ Removed user data directory'));
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Could not remove user data: ${error.message}`));
        }
      } else {
        console.log(chalk.yellow('⚠️  User data preserved (use --clean to remove)'));
        console.log(chalk.gray(`    Directory: ${configDir}`));
      }
    } else {
      console.log(chalk.gray('No user data directory found'));
    }
  }

  async verifyCleanup() {
    console.log(chalk.blue('🔍 Verifying cleanup...'));
    
    const checks = [
      // Check if npm package is still installed
      () => {
        try {
          execSync('npm list -g gemini-cli-updater', { stdio: 'pipe' });
          return { name: 'npm package', status: false, message: 'Still installed' };
        } catch {
          return { name: 'npm package', status: true, message: 'Removed' };
        }
      },
      
      // Check for binary files (only our wrapper, not real gemini)
      () => {
        const binaries = [
          path.join(this.homeDir, '.nvm/versions/node/*/bin/gemini'),
          '/usr/local/bin/gemini'
        ];
        
        for (const binary of binaries) {
          if (binary.includes('*')) {
            // Check nvm paths
            try {
              const basePath = binary.split('*')[0];
              if (fs.existsSync(basePath)) {
                const versions = fs.readdirSync(basePath);
                for (const version of versions) {
                  const fullPath = binary.replace('*', version);
                  if (fs.existsSync(fullPath)) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (content.includes('gemini-cli-updater')) {
                      return { name: 'wrapper binaries', status: false, message: 'Some wrappers still exist' };
                    }
                  }
                }
              }
            } catch {
              // Ignore errors
            }
          } else if (fs.existsSync(binary)) {
            try {
              const content = fs.readFileSync(binary, 'utf8');
              if (content.includes('gemini-cli-updater')) {
                return { name: 'wrapper binaries', status: false, message: 'Some wrappers still exist' };
              }
            } catch {
              // Ignore errors
            }
          }
        }
        return { name: 'wrapper binaries', status: true, message: 'All removed' };
      },
      
      // Check for aliases
      () => {
        const shellFiles = [
          path.join(this.homeDir, '.bashrc'),
          path.join(this.homeDir, '.bash_profile'),
          path.join(this.homeDir, '.zshrc')
        ];
        
        for (const shellFile of shellFiles) {
          if (fs.existsSync(shellFile)) {
            const content = fs.readFileSync(shellFile, 'utf8');
            if (content.includes('gemini-cli-updater') || content.includes("alias gemini=")) {
              return { name: 'shell aliases', status: false, message: 'Some aliases still exist' };
            }
          }
        }
        return { name: 'shell aliases', status: true, message: 'All removed' };
      }
    ];

    console.log(chalk.cyan('\nCleanup verification:'));
    let allClean = true;
    
    for (const check of checks) {
      const result = check();
      const icon = result.status ? '✅' : '❌';
      const color = result.status ? chalk.green : chalk.red;
      console.log(color(`  ${icon} ${result.name}: ${result.message}`));
      if (!result.status) allClean = false;
    }
    
    return allClean;
  }

  async manualCleanup() {
    console.log(chalk.red('🚨 Manual cleanup instructions:'));
    console.log(chalk.white('\n1. Remove npm package:'));
    console.log(chalk.gray('   npm uninstall -g gemini-cli-updater --force'));
    
    console.log(chalk.white('\n2. Remove wrapper binary files (keep real @google/gemini-cli):'));
    console.log(chalk.gray('   Check ~/.nvm/versions/node/*/bin/gemini and remove if it contains "gemini-cli-updater"'));
    console.log(chalk.gray('   rm -f ~/.nvm/versions/node/*/bin/gemini-cli-updater'));
    
    console.log(chalk.white('\n3. Remove aliases from shell config files:'));
    console.log(chalk.gray('   Edit ~/.bashrc, ~/.bash_profile, ~/.zshrc'));
    console.log(chalk.gray('   Remove lines containing "gemini-cli-updater" or "alias gemini="'));
    
    console.log(chalk.white('\n4. Remove user data (optional):'));
    console.log(chalk.gray('   rm -rf ~/.gemini-cli-updater'));
    
    console.log(chalk.white('\n5. Restart your terminal'));
    
    console.log(chalk.yellow('\nNote: This will preserve the real @google/gemini-cli package'));
  }
}

// Command line interface
if (require.main === module) {
  const cleanup = new CompleteCleanup();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.blue('Gemini CLI Updater - Complete Cleanup Tool'));
    console.log(chalk.white('\nUsage: node cleanup.js [options]'));
    console.log(chalk.white('\nOptions:'));
    console.log(chalk.gray('  --clean, --purge    Remove user data as well'));
    console.log(chalk.gray('  --force             Force removal without prompts'));
    console.log(chalk.gray('  --help, -h          Show this help message'));
    console.log(chalk.white('\nThis script will:'));
    console.log(chalk.gray('  • Uninstall the npm package'));
    console.log(chalk.gray('  • Remove wrapper binary files (preserve real gemini CLI)'));
    console.log(chalk.gray('  • Clean shell aliases'));
    console.log(chalk.gray('  • Optionally remove user data'));
    console.log(chalk.gray('  • Verify complete removal'));
  } else {
    cleanup.cleanup().catch(error => {
      console.error(chalk.red('Fatal error:'), error.message);
      process.exit(1);
    });
  }
}

module.exports = CompleteCleanup;