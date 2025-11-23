const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

/**
 * Sleep function for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends deployment notification email with retry logic
 * @param {Object} config - Configuration object
 * @param {Object} gitInfo - Git information object
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Email send result
 */
async function sendDeploymentNotification(config, gitInfo, options = {}) {
    const {
        dryRun = false,
        maxRetries = 3,
        retryDelay = 2000,
        templateName = 'animateEmailTemplate.ejs'
    } = options;

    // Create transporter
    const transporter = nodemailer.createTransport({
        service: config.smtp.service,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.password
        }
    });

    // Load and render email template
    const templatePath = path.join(__dirname, '../templates', templateName);
    const emailTemplate = fs.readFileSync(templatePath, 'utf8');

    const deploymentDate = new Date();
    const dateString = deploymentDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const timeString = deploymentDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const renderedTemplate = ejs.render(emailTemplate, {
        subject: `${config.app.name} - Deploy ${dateString} ${timeString}`,
        title: config.app.name,
        body: `Se realizó un nuevo despliegue para la aplicación ${config.app.name} (${config.app.type})`,
        urlapp: config.app.url,
        environment: config.app.environment,
        gitInfo: gitInfo,
        deploymentDate: deploymentDate.toISOString(),
        dateString,
        timeString
    });

    const mailOptions = {
        from: `${config.sender.name} <${config.sender.email}>`,
        to: config.recipients,
        subject: `[Deploy ${config.app.type.toUpperCase()}] ${config.app.name} - ${dateString} ${timeString}`,
        html: renderedTemplate
    };

    // Dry run mode
    if (dryRun) {
        console.log('\n--- DRY RUN MODE ---');
        console.log('Email would be sent with:');
        console.log('From:', mailOptions.from);
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('-------------------\n');
        return { dryRun: true, success: true };
    }

    // Send email with retry logic
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Sending email... (Attempt ${attempt}/${maxRetries})`);
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.response);
            return {
                success: true,
                messageId: info.messageId,
                response: info.response,
                attempt
            };
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                await sleep(retryDelay);
            }
        }
    }

    // All retries failed
    throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Verifies SMTP connection
 * @param {Object} config - Configuration object
 * @returns {Promise<boolean>}
 */
async function verifyConnection(config) {
    const transporter = nodemailer.createTransport({
        service: config.smtp.service,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.password
        }
    });

    try {
        await transporter.verify();
        console.log('SMTP connection verified successfully');
        return true;
    } catch (error) {
        console.error('SMTP connection verification failed:', error.message);
        return false;
    }
}

module.exports = {
    sendDeploymentNotification,
    verifyConnection
};
