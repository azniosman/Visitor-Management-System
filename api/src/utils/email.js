const nodemailer = require('nodemailer');

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} options.html - HTML email body
 * @returns {Promise} - Promise resolving to the sent message info
 */
exports.sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };
  
  // Send the email
  return await transporter.sendMail(mailOptions);
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @returns {Promise} - Promise resolving to the sent message info
 */
exports.sendWelcomeEmail = async (user) => {
  return await exports.sendEmail({
    to: user.email,
    subject: 'Welcome to Elisa Secure Access',
    text: `Welcome to Elisa Secure Access, ${user.name}! We're excited to have you on board.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Elisa Secure Access</h2>
        <p>Hello ${user.name},</p>
        <p>We're excited to have you on board! Your account has been created successfully.</p>
        <p>You can now log in to the system using your email and password.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Elisa Secure Access Team</p>
      </div>
    `
  });
};

/**
 * Send a notification email
 * @param {Object} options - Notification options
 * @param {Object} options.recipient - User object of the recipient
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Email message
 * @returns {Promise} - Promise resolving to the sent message info
 */
exports.sendNotificationEmail = async (options) => {
  return await exports.sendEmail({
    to: options.recipient.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${options.subject}</h2>
        <p>Hello ${options.recipient.name},</p>
        <p>${options.message}</p>
        <p>Best regards,<br>The Elisa Secure Access Team</p>
      </div>
    `
  });
};
