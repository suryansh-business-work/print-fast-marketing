import nodemailer from 'nodemailer';
import config from '../config/config';
import logger from './logger';

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

/**
 * Whether SMTP has enough configuration to attempt a send.
 *
 * Callers that mutate state before emailing should check this first — nodemailer
 * only fails at send time, which is too late to undo the change.
 */
export const isEmailConfigured = (): boolean =>
  Boolean(config.smtpHost && config.smtpUser && config.smtpPass);

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"ROAS PrintFast" <${config.smtpUser}>`,
      to,
      subject,
      text,
    });
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw new Error('Failed to send email');
  }
};
