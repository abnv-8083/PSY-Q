import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  selected_date: { type: String, required: true },
  selected_time: { type: String, required: true },
  session_type: { type: String, required: true },
  mode_of_therapy: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
