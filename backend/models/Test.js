import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  bundle_id: { type: String }, // Can link to a Bundle
  subject: { type: String },
  subject_id: { type: String }, // Link to a Subject _id
  duration: { type: Number, default: 60 }, // in minutes
  total_questions: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  is_free_trial: { type: Boolean, default: false },
  free_trial_limit: { type: Number, default: 1 },
  passing_score: { type: Number, default: 40 },
  display_order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Test = mongoose.model('Test', testSchema);
export default Test;
