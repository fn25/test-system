import nodemailer from 'nodemailer';

/**
 * Email Service using Nodemailer
 * 
 * Required Environment Variables:
 * - EMAIL_HOST: SMTP host (e.g., smtp.gmail.com)
 * - EMAIL_PORT: SMTP port (e.g., 587)
 * - EMAIL_USER: Email address
 * - EMAIL_PASS: Email password or App Password
 * - EMAIL_FROM: From address
 * - FRONTEND_URL: Frontend URL for reset links
 */

// Create reusable transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS in .env');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false // For development, remove in production
    }
  });
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} username - User's username
 * @returns {Promise<object>}
 */
export const sendPasswordResetEmail = async (email, resetToken, username) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      throw new Error('Email service not configured');
    }

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Quiz System'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .content {
              background: white;
              border-radius: 8px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0;">🔐 Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Test System - Quiz Platform</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in <strong>1 hour</strong>.<br>
              If you didn't request this reset, please ignore this email.
            </div>
            
            <p>For security reasons:</p>
            <ul>
              <li>Never share this link with anyone</li>
              <li>We will never ask for your password via email</li>
              <li>This link can only be used once</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This email was sent from Test System Quiz Platform</p>
            <p>If you have questions, please contact support</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        Hi ${username},
        
        We received a request to reset your password.
        
        Click this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        Test System Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};

/**
 * Send welcome email to new users
 * @param {string} email - Recipient email
 * @param {string} username - User's username
 * @returns {Promise<object>}
 */
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('Email service not configured, skipping welcome email');
      return { success: true, skipped: true };
    }

    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Quiz System'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to Quiz System!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 8px;
              padding: 30px;
              margin-top: 20px;
              color: #333;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0; font-size: 36px;">🎉</h1>
            <h1 style="margin: 10px 0;">Welcome to Quiz System!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been created successfully</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${username}</strong>,</p>
            
            <p>Welcome to our Quiz Platform! We're excited to have you on board. 🚀</p>
            
            <p>You can now:</p>
            <ul style="text-align: left;">
              <li>Take quizzes and test your knowledge</li>
              <li>Track your progress and scores</li>
              <li>Compete with other users</li>
              <li>Access quizzes anytime, anywhere</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">Start Taking Quizzes</a>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy learning! 📚</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
    
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    // Don't throw error for welcome emails
    return { success: false, error: error.message };
  }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
export const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return false;
    }

    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    return false;
  }
};

export default {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  verifyEmailConfig
};
