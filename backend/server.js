import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendEmail, sendOTPEmail, sendAdminInviteEmail, sendPasswordResetEmail } from './utils/emailService.js';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import mongoose from 'mongoose';
import * as authController from './controllers/authController.js';
import * as analyticsController from './controllers/analyticsController.js';
import * as contactController from './controllers/contactController.js';
import * as notificationsController from './controllers/notificationsController.js';
import * as adminManagementController from './controllers/adminController.js';
import * as bundleController from './controllers/bundleController.js';
import * as paymentController from './controllers/paymentController.js';
import { Student, Admin, Booking, PurchaseRequest, Payment, Subject, Bundle, Test, Question, Result, ContactSubmission, Notification } from './models/index.js';

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
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/reset-password', authController.resetPassword);
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
    const requests = await PurchaseRequest.find()
      .populate('user_id', 'full_name email phone')
      .sort({ created_at: -1 });

    const tests = await Test.find().select('name');
    const bundles = await Bundle.find().select('name');

    const mapped = requests.map(req => {
      const doc = req.toObject();
      let itemName = 'Unknown Item';
      if (doc.item_type === 'test') {
        const t = tests.find(t => t._id.toString() === doc.item_id);
        if (t) itemName = t.name;
      } else if (doc.item_type === 'bundle') {
        const b = bundles.find(b => b._id.toString() === doc.item_id);
        if (b) itemName = b.name;
      }
      return { ...doc, item_name: itemName };
    });

    res.json({ success: true, data: mapped });
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

// Analytics (Admin)
app.get('/api/admin/analytics/stats', analyticsController.getDashboardStats);
app.get('/api/admin/analytics/users/:userId', analyticsController.getUserAnalytics);
app.get('/api/admin/analytics/search', analyticsController.searchUsers);

// Contact Submissions
app.get('/api/admin/contact-submissions', contactController.getSubmissions);
app.post('/api/contact-submissions', contactController.createSubmission);
app.delete('/api/admin/contact-submissions/:id', contactController.deleteSubmission);

// Notifications
app.get('/api/notifications', notificationsController.getNotifications);
app.post('/api/admin/notifications', notificationsController.createNotification);
app.put('/api/admin/notifications/:id', notificationsController.updateNotification);
app.delete('/api/admin/notifications/:id', notificationsController.deleteNotification);
app.post('/api/admin/notifications/reorder', notificationsController.reorderNotifications);

// Student Management (Admin)
app.get('/api/admin/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ created_at: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Management (Superadmin)
app.get('/api/admin/management', adminManagementController.getAdmins);
app.post('/api/admin/management', adminManagementController.createAdmin);
app.put('/api/admin/management/:id', adminManagementController.updateAdmin);
app.delete('/api/admin/management/:id', adminManagementController.deleteAdmin);
app.get('/api/student/payments', paymentController.getStudentPayments);
app.post('/api/payments', paymentController.createPayment);
app.post('/api/admin/send-invite', (req, res) => {
    // TODO: Integrate actual email service (Nodemailer, Resend, etc.)
    console.log('Sending invite to:', req.body.email);
    res.json({ success: true, message: 'Invite sent' });
});

// Student endpoints for purchase requests
app.post('/api/student/purchase-requests', async (req, res) => {
  try {
    const { userId, itemType, itemId, requestNumber } = req.body;
    
    // Check if there's already a pending request for this item and user
    const existing = await PurchaseRequest.findOne({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      status: 'pending'
    });

    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const newRequest = new PurchaseRequest({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      request_number: requestNumber,
      status: 'pending'
    });
    
    await newRequest.save();
    res.json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Create Purchase Request Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/student/purchase-requests', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });

    const requests = await PurchaseRequest.find({ user_id: userId }).sort({ created_at: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Fetch Student Purchase Requests Error:', error);
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

app.post('/api/subjects', async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/tests', async (req, res) => {
  try {
    const { subjectId } = req.query;
    const filter = subjectId ? { subject_id: subjectId } : {};
    const tests = await Test.find(filter).sort({ display_order: 1 });
    res.json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/tests', async (req, res) => {
  try {
    const test = new Test(req.body);
    await test.save();
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/tests/:id', async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/tests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Cascade-delete all questions belonging to this test
    await Question.deleteMany({ test_id: id });
    await Test.findByIdAndDelete(id);
    res.json({ success: true, message: 'Test and its questions deleted successfully' });
  } catch (error) {
    console.error('Delete Test Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bundle Routes
app.get('/api/bundles', bundleController.getBundles);
app.get('/api/bundles/:id', bundleController.getBundleById);
app.post('/api/admin/bundles', bundleController.createBundle);
app.put('/api/admin/bundles/:id', bundleController.updateBundle);
app.delete('/api/admin/bundles/:id', bundleController.deleteBundle);
app.post('/api/admin/bundles/reorder', bundleController.reorderBundles);

app.get('/api/tests/:id/questions', async (req, res) => {
  try {
    const questions = await Question.find({ test_id: req.params.id });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Questions API
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find().limit(100);
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    // Update test total questions count
    await Test.findByIdAndUpdate(req.body.test_id, { $inc: { total_questions: 1 } });
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndRemove(req.params.id);
    if (question) {
        await Test.findByIdAndUpdate(question.test_id, { $inc: { total_questions: -1 } });
    }
    res.json({ success: true, message: 'Question removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Results / Analytics API
app.post('/api/results', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/results/latest', async (req, res) => {
  try {
    const { testId, userId } = req.query;
    const result = await Result.findOne({ test_id: testId, user_id: userId })
      .sort({ created_at: -1 });
    
    if (!result) return res.status(404).json({ success: false, message: 'No results found' });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/bundles', async (req, res) => {
  try {
    const bundles = await Bundle.find().sort({ display_order: 1 });
    res.json({ success: true, data: bundles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Native MongoDB Bundle Management
app.post('/api/bundles', async (req, res) => {
  try {
    const bundle = new Bundle(req.body);
    await bundle.save();
    res.json({ success: true, data: bundle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/bundles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bundle = await Bundle.findByIdAndUpdate(id, req.body, { new: true });
    if (!bundle) return res.status(404).json({ success: false, message: 'Bundle not found' });
    res.json({ success: true, data: bundle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/bundles/:id', async (req, res) => {
  try {
    await Bundle.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bundle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin proxy paths for Supabase Bundle updates (Keeping for now but preferring native)
app.put('/api/admin/bundles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Also update MongoDB if it exists there
    await Bundle.findByIdAndUpdate(id, req.body).catch(() => {});
    
    if (supabase) {
      const { data, error } = await supabase.from('bundles').update(req.body).eq('id', id).select().single();
      if (!error) return res.json({ success: true, data });
    }
    
    // Fallback or if already fully on mongo
    const updated = await Bundle.findById(id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin proxy paths for Supabase Bundle updates (to bypass RLS)
app.put('/api/admin/bundles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('bundles').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/bundles/:id/tests', async (req, res) => {
  try {
    const { id } = req.params;
    const { testId } = req.body;
    const { data, error } = await supabase.from('bundle_tests').insert({ bundle_id: id, test_id: testId }).select();
    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/admin/bundles/:id/tests/:testId', async (req, res) => {
  try {
    const { id, testId } = req.params;
    const { error } = await supabase.from('bundle_tests').delete().eq('bundle_id', id).eq('test_id', testId);
    if (error) throw error;
    res.json({ success: true });
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
