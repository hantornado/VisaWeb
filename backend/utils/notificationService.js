/**
 * Notification Service
 * Handles sending notifications for visa application status updates
 */

const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send email notification for application status update
 * @param {Object} application - The application object
 * @param {String} previousStatus - The previous status
 * @param {String} newStatus - The new status
 * @param {String} email - Recipient email address
 */
exports.sendStatusUpdateEmail = async (application, previousStatus, newStatus, email) => {
  try {
    // Skip if email service is not configured
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Skipping notification.');
      return;
    }

    // Skip if no recipient email
    if (!email) {
      console.log('No recipient email provided. Skipping notification.');
      return;
    }

    const transporter = createTransporter();

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Visa Application Status Update - ${application.uniqueApplicationCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Visa Application Status Update</h2>
          <p>Dear ${application.fullName},</p>
          <p>Your visa application with reference number <strong>${application.uniqueApplicationCode}</strong> has been updated.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Previous Status:</strong> ${previousStatus}</p>
            <p><strong>New Status:</strong> <span style="color: #2980b9; font-weight: bold;">${newStatus}</span></p>
          </div>
          <p>You can check the details of your application by logging into our portal using your passport number and unique code.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you,<br>Visa Processing Team</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Status update notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending notification email:', error);
    return false;
  }
};

/**
 * Send SMS notification for application status update
 * This is a placeholder for SMS integration
 * Implement with your preferred SMS provider (Twilio, Nexmo, etc.)
 */
exports.sendStatusUpdateSMS = async (application, previousStatus, newStatus, phoneNumber) => {
  try {
    // This is a placeholder - implement with actual SMS provider
    console.log(`[SMS Notification] To: ${phoneNumber}, Application: ${application.uniqueApplicationCode}, Status: ${previousStatus} → ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return false;
  }
};

/**
 * Send notification based on user preferences
 * @param {Object} application - The application object
 * @param {String} previousStatus - The previous status
 * @param {String} newStatus - The new status
 */
exports.sendStatusUpdateNotification = async (application, previousStatus, newStatus) => {
  const results = {
    email: false,
    sms: false
  };

  // Send email notification if contact email is available
  if (application.contactEmail) {
    results.email = await exports.sendStatusUpdateEmail(
      application,
      previousStatus,
      newStatus,
      application.contactEmail
    );
  }

  // Send SMS notification if contact phone is available
  if (application.contactPhone) {
    results.sms = await exports.sendStatusUpdateSMS(
      application,
      previousStatus,
      newStatus,
      application.contactPhone
    );
  }

  return results;
};