import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin'], default: 'admin' },
  permissions: { type: Map, of: Boolean, default: {} },
  is_blocked: { type: Boolean, default: false },
  reset_token: { type: String },
  reset_expires_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
