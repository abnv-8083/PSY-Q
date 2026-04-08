import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendEmail, sendOTPEmail, sendAdminInviteEmail, sendPasswordResetEmail } from './utils/emailService.js';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import * as authController from './controllers/authController.js';
import { Student, Admin, Booking, PurchaseRequest, Payment } from './models/index.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase (keeping for migration scripts if needed)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
let supabase = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Initialize MongoDB
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('🍃 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const adminEmail = 'psyqonline@gmail.com';

// User confirmation email template
const userEmailTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ca0056; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .details { background-color: white; padding: 15px; border-left: 4px solid #ca0056; margin: 20px 0; }
    .label { font-weight: bold; color: #ca0056; }
    .footer { color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>Booking Confirmation</h2></div>
    <div class="content">
      <p>Hello ${data.fullName},</p>
      <p>Your consultation is confirmed for:</p>
      <div class="details">
        <p><span class="label">Date:</span> ${data.selectedDate}</p>
        <p><span class="label">Time:</span> ${data.selectedTime}</p>
        <p><span class="label">Session:</span> ${data.sessionType} (${data.modeOfTherapy})</p>
      </div>
      <p>Best regards,<br>The PSY-Q Team</p>
    </div>
  </div>
</body>
</html>
`;

// --- Authentication Routes ---
app.post('/api/auth/student/signup', authController.studentSignup);
app.post('/api/auth/student/verify', authController.studentVerify);
app.post('/api/auth/student/login', authController.studentLogin);
app.post('/api/auth/admin/login', authController.adminLogin);
app.get('/api/student/profile', authController.getStudentProfile);
app.put('/api/student/profile', authController.updateStudentProfile);
// API Routes
app.post('/api/sendBookingEmails', async (req, res) => {
  try {
    const bookingData = req.body;

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
      console.error('Email attempt failed: RESEND_API_KEY not configured');
      return res.status(503).json({ 
        success: false, 
        message: 'Email service is currently unavailable. Please contact support.' 
      });
    }
    
    // Send email to user
    await sendEmail({
      to: bookingData.email,
      subject: `Booking Confirmation - ${bookingData.selectedDate}`,
      html: userEmailTemplate(bookingData)
    });

    // Send notification to admin
    await sendEmail({
      to: adminEmail,
      subject: `New Booking: ${bookingData.fullName}`,
      html: `<p>New booking from ${bookingData.fullName} (${bookingData.email}) on ${bookingData.selectedDate} at ${bookingData.selectedTime}</p>`
    });

    // Store in MongoDB
    const newBooking = new Booking({
      full_name: bookingData.fullName,
      email: bookingData.email,
      phone: bookingData.phone,
      selected_date: bookingData.selectedDate,
      selected_time: bookingData.selectedTime,
      session_type: bookingData.sessionType,
      mode_of_therapy: bookingData.modeOfTherapy
    });
    await newBooking.save();

    if (error) throw error;

    res.json({ success: true, message: 'Booking processed successfully' });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, name, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    await sendOTPEmail(email, name || 'Student', otp);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send verification email' });
  }
});

app.post('/api/admin/send-invite', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    await sendAdminInviteEmail(email, name || 'Administrator', password);
    res.json({ success: true, message: 'Invite email sent successfully' });
  } catch (error) {
    console.error('Send Invite error:', error);
    res.status(500).json({ success: false, message: 'Failed to send invite email' });
  }
});

// Admin endpoint to securely fetch purchase requests with student details
app.get('/api/admin/purchase-requests', async (req, res) => {
  try {
    // 1. Fetch requests with basic related data
    // Fetch requests with student details using Mongoose populate
    const requests = await PurchaseRequest.find()
      .populate('user_id', 'full_name email phone')
      .sort({ created_at: -1 });

    // 2. Fetch all bundles and tests just like the frontend did, but securely in one go
    // (We could do this efficiently or just let the frontend do it, but returning it all is cleaner)
    // Actually, we can just return the requests and let the frontend map items, or do it here.
    // Let's just return what the DB returns, and let frontend format it if needed.
    
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Fetch Purchase Requests Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin endpoint to securely approve a purchase request
app.post('/api/admin/purchase-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the request
    const request = await PurchaseRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status === 'approved') return res.status(400).json({ success: false, message: 'Already approved' });

    // 2. Grant Access based on item type
    if (request.item_type === 'test') {
      await Payment.create({
        user_id: request.user_id,
        type: 'test',
        item_id: request.item_id,
        amount: 0,
        status: 'success',
        payment_id: `manual_${request._id}`
      });
    }
    // Note: for 'bundle', we can handle user_bundles or similar collection

    // 3. Update Request Status
    request.status = 'approved';
    request.updated_at = new Date();
    await request.save();
    
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Approve Purchase Request Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin endpoint to securely reject a purchase request
app.post('/api/admin/purchase-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the request
    const request = await PurchaseRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status === 'approved') return res.status(400).json({ success: false, message: 'Cannot reject an already approved request' });

    // 2. Update Status
    request.status = 'rejected';
    request.updated_at = new Date();
    await request.save();
    
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Reject Purchase Request Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- Data Routes ---
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/tests', async (req, res) => {
  try {
    const tests = await Test.find();
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/bundles', async (req, res) => {
  try {
    const bundles = await Bundle.find();
    res.json({ success: true, data: bundles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/user/attempts', async (req, res) => {
  try {
    const { userId } = req.query;
    // For now, returning empty or fetching from a Results/Attempts model if we migrate it
    const attempts = await Result.find({ user_id: userId });
    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/user/access', async (req, res) => {
  try {
    const { userId } = req.query;
    const approvedRequests = await PurchaseRequest.find({ user_id: userId, status: 'approved' });
    const payments = await Payment.find({ user_id: userId, status: 'success' });
    
    // Combine access IDs
    const accessIds = new Set();
    approvedRequests.forEach(r => accessIds.add(r.item_id));
    payments.forEach(p => accessIds.add(p.item_id));
    
    res.json({ success: true, data: Array.from(accessIds) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/send-reset-link', async (req, res) => {
  try {
    const { email, name, resetLink } = req.body;
    if (!email || !resetLink) {
      return res.status(400).json({ success: false, message: 'Email and reset link are required' });
    }

    await sendPasswordResetEmail(email, name || 'User', resetLink);
    res.json({ success: true, message: 'Reset link sent successfully' });
  } catch (error) {
    console.error('Send Reset Link error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
        return res.status(500).json({ success: false, message: 'Razorpay secret not configured' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment verified
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// SMTP Debug Endpoint
app.get('/api/debug-smtp', async (req, res) => {
  try {
    const { transporter } = await import('./utils/emailService.js');
    await transporter.verify();
    res.json({ 
      success: true, 
      message: 'SMTP connection verified successfully',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        from: process.env.SMTP_FROM
      }
    });
  } catch (error) {
    console.error('SMTP Debug Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'SMTP verification failed', 
      error: error.message,
      code: error.code,
      command: error.command
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
});
