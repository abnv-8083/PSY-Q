import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  phone: { type: String },
  is_verified: { type: Boolean, default: false },
  otp_code: { type: String },
  otp_expires_at: { type: Date },
  last_login: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
