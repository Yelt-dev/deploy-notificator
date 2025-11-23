#!/usr/bin/env node

const { getConfig } = require('./lib/config');
const { getGitInfo, isGitRepository } = require('./lib/git-info');
const { sendDeploymentNotification, verifyConnection } = require('./lib/mailer');

/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        type: 'frontend',
        dryRun: false,
        verify: false,
        help: false,
        projectDir: process.cwd(),
        appName: null,
        appUrl: null
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else if (arg === '--type' || arg === '-t') {
            options.type = args[++i];
        } else if (arg === '--dry-run' || arg === '-d') {
            options.dryRun = true;
        } else if (arg === '--verify' || arg === '-v') {
            options.verify = true;
        } else if (arg === '--project-dir' || arg === '-p') {
            options.projectDir = args[++i];
        } else if (arg === '--app-name' || arg === '-n') {
            options.appName = args[++i];
        } else if (arg === '--app-url' || arg === '-u') {
            options.appUrl = args[++i];
        }
    }

    return options;
}

/**
 * Display help message
 */
function showHelp() {
    console.log(`
Deploy Notificator - Send email notifications for deployments

Usage:
  node src/notificator.js [options]

Options:
  -t, --type <type>        Deployment type: 'frontend' or 'backend' (default: frontend)
  -n, --app-name <name>    Override app name (optional, uses .env if not provided)
  -u, --app-url <url>      Override app URL (optional, uses .env if not provided)
  -p, --project-dir <dir>  Path to the project to extract git info from (default: current dir)
  -d, --dry-run            Test mode - don't actually send emails
  -v, --verify             Verify SMTP connection only
  -h, --help               Show this help message

Examples:
  # Using .env configuration
  node src/notificator.js --type frontend
  node src/notificator.js --type backend --dry-run

  # Overriding app name and URL (useful for multiple projects with one notificator)
  node src/notificator.js --type frontend --app-name "My Shop" --app-url "https://shop.com"

  # From another project's deploy script
  node /path/to/deploy-notificator/src/notificator.js \
    --type frontend \
    --project-dir /path/to/my-app \
    --app-name "My App" \
    --app-url "https://myapp.com"

  # Centralized notificator for multiple projects
  node /opt/deploy-notificator/src/notificator.js \
    --type backend \
    --app-name "Payment API" \
    --app-url "https://api.payment.com"

Environment Variables:
  See .env.example for required configuration
    `);
}

/**
 * Main function
 */
async function main() {
    const options = parseArgs();

    // Show help if requested
    if (options.help) {
        showHelp();
        process.exit(0);
    }

    console.log('=== Deploy Notificator ===\n');

    try {
        // Validate deployment type
        if (!['frontend', 'backend'].includes(options.type)) {
            throw new Error(`Invalid deployment type: ${options.type}. Must be 'frontend' or 'backend'`);
        }

        // Load configuration
        console.log(`Loading configuration for ${options.type} deployment...`);
        const config = getConfig(options.type, {
            appName: options.appName,
            appUrl: options.appUrl
        });

        // Verify SMTP connection if requested
        if (options.verify) {
            console.log('\nVerifying SMTP connection...');
            const verified = await verifyConnection(config);
            process.exit(verified ? 0 : 1);
        }

        // Get git information
        let gitInfo;
        const projectDir = options.projectDir;
        console.log(`Checking git repository at: ${projectDir}`);

        if (isGitRepository(projectDir)) {
            console.log('Extracting git information...');
            gitInfo = getGitInfo(projectDir);
            console.log(`  Branch: ${gitInfo.branch}`);
            console.log(`  Commit: ${gitInfo.commit}`);
            console.log(`  Author: ${gitInfo.author}`);
        } else {
            console.log('Warning: Not a git repository, using default values');
            gitInfo = {
                branch: 'N/A',
                commit: 'N/A',
                commitFull: 'N/A',
                author: 'N/A',
                authorEmail: 'N/A',
                message: 'N/A',
                timestamp: new Date().toISOString()
            };
        }

        // Send notification
        console.log('\nPreparing to send notification...');
        console.log(`  App: ${config.app.name}`);
        console.log(`  Type: ${config.app.type}`);
        console.log(`  Environment: ${config.app.environment}`);
        console.log(`  Recipients: ${config.recipients.join(', ')}`);

        const result = await sendDeploymentNotification(config, gitInfo, {
            dryRun: options.dryRun
        });

        if (result.success) {
            console.log('\n✓ Notification sent successfully!');
            if (result.messageId) {
                console.log(`  Message ID: ${result.messageId}`);
            }
            process.exit(0);
        }

    } catch (error) {
        console.error('\n✗ Error:', error.message);

        if (error.message.includes('Missing required environment variables')) {
            console.error('\nPlease ensure your .env file is configured correctly.');
            console.error('See .env.example for reference.');
        }

        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { main, parseArgs };
