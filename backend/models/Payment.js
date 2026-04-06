import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, enum: ['test', 'bundle'], required: true },
  item_id: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  payment_id: { type: String }, // Razorpay Payment ID
  order_id: { type: String }, // Razorpay Order ID
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
