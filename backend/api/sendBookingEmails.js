import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const adminEmail = 'psyqonline@gmail.com';

// User confirmation email template
const userEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ca0056; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background-color: white; padding: 15px; border-left: 4px solid #ca0056; margin: 20px 0; }
    .details-item { margin: 10px 0; }
    .label { font-weight: bold; color: #ca0056; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Booking Confirmation</h2>
    </div>
    <div class="content">
      <p>Hello ${data.fullName},</p>
      <p>Thank you for booking your session with us. Your consultation is confirmed for:</p>
      
      <div class="details">
        <div class="details-item">
          <span class="label">Date:</span> ${data.selectedDate}
        </div>
        <div class="details-item">
          <span class="label">Time:</span> ${data.selectedTime}
        </div>
        <div class="details-item">
          <span class="label">Session Type:</span> ${data.sessionType}
        </div>
        <div class="details-item">
          <span class="label">Mode of Therapy:</span> ${data.modeOfTherapy}
        </div>
        <div class="details-item">
          <span class="label">Package:</span> ${data.packageName || 'N/A'}
        </div>
      </div>
      
      <p>We look forward to our session. If you need to reschedule or have any questions, please reply to this email or contact us as soon as possible.</p>
      
      <p>Best regards,<br>The PSY-Q Team</p>
      
      <div class="footer">
        <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Admin notification email template
const adminEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1a1a1a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background-color: white; padding: 15px; border: 1px solid #ddd; margin: 20px 0; border-radius: 4px; }
    .details-item { margin: 8px 0; }
    .label { font-weight: bold; color: #1a1a1a; width: 150px; display: inline-block; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Booking Notification</h2>
    </div>
    <div class="content">
      <p>A new session has been booked:</p>
      
      <div class="details">
        <div class="details-item">
          <span class="label">Full Name:</span> ${data.fullName}
        </div>
        <div class="details-item">
          <span class="label">Email:</span> ${data.email}
        </div>
        <div class="details-item">
          <span class="label">Phone:</span> ${data.phone || 'N/A'}
        </div>
        <div class="details-item">
          <span class="label">Age:</span> ${data.age || 'N/A'}
        </div>
        <div class="details-item">
          <span class="label">Mode of Therapy:</span> ${data.modeOfTherapy || 'N/A'}
        </div>
        <div class="details-item">
          <span class="label">Primary Concern:</span> ${data.primaryConcern || 'N/A'}
        </div>
        <div class="details-item">
          <span class="label">Session Type:</span> ${data.sessionType || 'N/A'}
        </div>
        <div class="details-item">
          <span class="label">Booking Date:</span> ${data.selectedDate}
        </div>
        <div class="details-item">
          <span class="label">Booking Time:</span> ${data.selectedTime}
        </div>
        <div class="details-item">
          <span class="label">Package:</span> ${data.packageName || 'N/A'}
        </div>
      </div>
      
      <p style="color: #666; font-size: 12px;">Booking made on: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
`;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.RESEND_API_KEY || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables for email or database');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: missing credentials'
      });
    }

    const bookingData = req.body;

    // Validate required fields
    if (!bookingData.email || !bookingData.fullName || !bookingData.selectedDate || !bookingData.selectedTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Send confirmation email to user
    const userEmailResult = await resend.emails.send({
      from: 'noreply@psyqlearning.com',
      to: bookingData.email,
      subject: `Booking Confirmation - ${bookingData.selectedDate}`,
      html: userEmailTemplate(bookingData)
    });

    if (userEmailResult.error) {
      console.error('User email send error:', userEmailResult.error);
      throw new Error('Failed to send confirmation email to user');
    }

    // Send notification email to admin
    const adminEmailResult = await resend.emails.send({
      from: 'noreply@psyqlearning.com',
      to: adminEmail,
      subject: `New Booking: ${bookingData.fullName} - ${bookingData.selectedDate}`,
      html: adminEmailTemplate(bookingData)
    });

    if (adminEmailResult.error) {
      console.error('Admin email send error:', adminEmailResult.error);
      throw new Error('Failed to send notification email to admin');
    }

    // Store booking in Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          full_name: bookingData.fullName,
          email: bookingData.email,
          phone: bookingData.phone || null,
          age: bookingData.age ? parseInt(bookingData.age) : null,
          mode_of_therapy: bookingData.modeOfTherapy || null,
          primary_concern: bookingData.primaryConcern || null,
          session_type: bookingData.sessionType || null,
          selected_date: bookingData.selectedDate,
          selected_time: bookingData.selectedTime,
          package_details: bookingData.packageDetails || null
        }
      ])
      .select();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error('Failed to save booking to database');
    }

    return res.status(200).json({
      success: true,
      message: 'An email with the confirmation has been sent',
      bookingId: data[0]?.id
    });
  } catch (error) {
    console.error('Booking error:', error?.message || error, error?.stack);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process booking'
    });
  }
}
