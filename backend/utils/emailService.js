import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const defaultFrom = process.env.SMTP_FROM || 'PSY-Q Team <noreply@psyqlearning.com>';

/**
 * Send an email
 * @param {Object} options - { to, subject, text, html }
 */
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const { data, error } = await resend.emails.send({
            from: defaultFrom,
            to,
            subject,
            text: text || '',
            html: html || '',
        });

        if (error) {
            console.error('Error sending email via Resend:', error);
            throw error;
        }

        console.log('Message sent via Resend: %s', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Exception sending email via Resend:', error);
        throw error;
    }
};

/**
 * Send OTP Email
 */
export const sendOTPEmail = async (to, name, otp) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ca0056; text-align: center;">Verify Your Email</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with PSY-Q. Use the following dynamic One-Time Password (OTP) to complete your sign-up process:</p>
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #64748b; font-size: 12px; text-align: center;">&copy; 2024 PSY-Q. All rights reserved.</p>
    </div>
    `;

    return sendEmail({
        to,
        subject: `${otp} is your PSY-Q verification code`,
        html
    });
};

/**
 * Send Admin Invite Email
 */
export const sendAdminInviteEmail = async (to, name, password) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ca0056; text-align: center;">Welcome to the PSY-Q Admin Team</h2>
        <p>Hello ${name},</p>
        <p>An administrator account has been created for you. You can log in using the credentials below:</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${to}</p>
            <p><strong>Temporary Password:</strong> <span style="color: #ca0056; font-family: monospace; font-size: 18px;">${password}</span></p>
        </div>
        <p>For security reasons, please change your password immediately after your first login.</p>
        <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/signin" style="background-color: #ca0056; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Admin Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #64748b; font-size: 12px; text-align: center;">&copy; 2024 PSY-Q. All rights reserved.</p>
    </div>
    `;

    return sendEmail({
        to,
        subject: 'Your PSY-Q Administrator Account',
        html
    });
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (to, name, resetLink) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ca0056; text-align: center;">Reset Your Password</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ca0056; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #64748b; font-size: 12px; text-align: center;">&copy; 2024 PSY-Q. All rights reserved.</p>
    </div>
    `;

    return sendEmail({
        to,
        subject: 'Password Reset Request',
        html
    });
};
