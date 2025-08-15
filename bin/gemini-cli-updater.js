#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

const Updater = require('../lib/updater');
const Logger = require('../lib/logger');

class GeminiUpdaterCLI {
  constructor() {
    this.updater = new Updater('@google/gemini-cli', 'gemini');
    this.logger = new Logger();
  }

  async run() {
    try {
      // Skip update check if --skip-update flag is present
      if (!process.argv.includes('--skip-update')) {
        await this.checkAndUpdate();
      }

      // Pass all arguments to the actual gemini command
      const args = process.argv.slice(2).filter(arg => arg !== '--skip-update');
      await this.launchGemini(args);
    } catch (error) {
      this.logger.error('Failed to run Gemini:', error.message);
      process.exit(1);
    }
  }

  async checkAndUpdate() {
    const spinner = ora('Checking for Gemini updates...').start();
    
    try {
      const needsUpdate = await this.updater.checkForUpdate();
      
      if (needsUpdate) {
        spinner.text = 'Updating Gemini CLI...';
        await this.updater.performUpdate();
        spinner.succeed(chalk.green('Gemini CLI updated successfully!'));
      } else {
        spinner.succeed(chalk.blue('Gemini CLI is up to date'));
      }
    } catch (error) {
      spinner.fail(chalk.yellow('Update check failed, proceeding with current version'));
      this.logger.warn('Update error:', error.message);
    }
  }

  async launchGemini(args) {
    return new Promise((resolve, reject) => {
      // Find the actual @google/gemini-cli package and call it directly
      const path = require('path');
      let geminiPath;
      
      try {
        // Use Node.js module resolution with global paths to find the package
        const { execSync } = require('child_process');
        const globalNodeModules = execSync('npm root -g', { encoding: 'utf8' }).trim();
        const geminiPackagePath = path.join(globalNodeModules, '@google', 'gemini-cli');
        const packageJsonPath = path.join(geminiPackagePath, 'package.json');
        
        if (!require('fs').existsSync(packageJsonPath)) {
          throw new Error('Package not found in global modules');
        }
        
        const packageJson = require(packageJsonPath);
        geminiPath = path.join(geminiPackagePath, packageJson.bin.gemini);
      } catch (error) {
        this.logger.error('Could not find @google/gemini-cli package. Please install it first with: npm i -g @google/gemini-cli');
        reject(new Error('Gemini CLI not found'));
        return;
      }

      const gemini = spawn('node', [geminiPath, ...args], {
        stdio: 'inherit',
        shell: false
      });

      gemini.on('error', (error) => {
        if (error.code === 'ENOENT') {
          this.logger.error('Gemini CLI not found. Please install it first with: npm i -g @google/gemini-cli');
          reject(new Error('Gemini CLI not installed'));
        } else {
          reject(error);
        }
      });

      gemini.on('close', (code) => {
        process.exit(code || 0);
      });

      // Handle process termination
      process.on('SIGINT', () => gemini.kill('SIGINT'));
      process.on('SIGTERM', () => gemini.kill('SIGTERM'));
    });
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled error:'), error.message);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  const cli = new GeminiUpdaterCLI();
  cli.run().catch(error => {
    console.error(chalk.red('Fatal error:'), error.message);
    process.exit(1);
  });
}

module.exports = GeminiUpdaterCLI;