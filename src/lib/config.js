require('dotenv').config();

/**
 * Validates that all required environment variables are present
 */
function validateConfig() {
    const required = [
        'SMTP_SERVICE',
        'SMTP_USER',
        'SMTP_APP_PASSWORD',
        'EMAIL_RECIPIENTS',
        'SENDER_NAME'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}\nPlease check your .env file`);
    }
}

/**
 * Gets configuration for a specific deployment type
 * @param {string} type - 'frontend' or 'backend'
 * @param {Object} overrides - Optional overrides for app name and url
 * @returns {Object} Configuration object
 */
function getConfig(type, overrides = {}) {
    validateConfig();

    const appNameKey = `APP_NAME_${type.toUpperCase()}`;
    const appUrlKey = `APP_URL_${type.toUpperCase()}`;

    // Use override values if provided, otherwise use env variables
    let appName = overrides.appName || process.env[appNameKey];
    let appUrl = overrides.appUrl || process.env[appUrlKey] || 'N/A';

    // If no app name is provided via CLI or env, throw error
    if (!appName) {
        throw new Error(
            `Missing app name. Either:\n` +
            `  1. Set ${appNameKey} in your .env file, or\n` +
            `  2. Use --app-name flag when running the command`
        );
    }

    return {
        smtp: {
            service: process.env.SMTP_SERVICE,
            user: process.env.SMTP_USER,
            password: process.env.SMTP_APP_PASSWORD
        },
        sender: {
            name: process.env.SENDER_NAME,
            email: process.env.SMTP_USER
        },
        recipients: process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim()),
        app: {
            name: appName,
            url: appUrl,
            type: type,
            environment: process.env.ENVIRONMENT || 'production'
        }
    };
}

module.exports = {
    getConfig,
    validateConfig
};
