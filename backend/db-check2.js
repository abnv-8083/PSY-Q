import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  subject_id: { type: String },
  is_published: { type: Boolean }
}, { strict: false });
const Test = mongoose.model('Test', testSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const tests = await Test.find({ name: 'December 2015 Paper 2 - I' });
    console.log("Found tests:");
    tests.forEach(t => console.log(JSON.stringify(t, null, 2)));
    process.exit(0);
}
check();
