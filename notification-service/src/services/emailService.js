const axios = require('axios');
const config = require('../config');
const { createLogger } = require('../../../common/utils/logger');

const logger = createLogger('email-service');

class EmailService {
  async sendEmail(to, subject, message) {
    if (!config.emailService.enabled) {
      logger.info('Email service disabled, skipping email send', { to, subject });
      return { success: true, message: 'Email service disabled (mock mode)' };
    }

    try {
      // In production, integrate with actual email service (SendGrid, SES, etc.)
      // For now, this is a mock implementation
      logger.info('Sending email', { to, subject });
      
      // Mock email sending - in production, replace with actual API call
      // Example: await axios.post('https://api.sendgrid.com/v3/mail/send', {...});
      
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        sentAt: new Date()
      };
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

