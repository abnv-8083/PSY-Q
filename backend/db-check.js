import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  is_active: { type: Boolean, default: true }
});
const Test = mongoose.model('Test', testSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const tests = await Test.find();
    console.log("Tests in DB:");
    tests.forEach(t => console.log(`- ${t.name} (id: ${t._id})`));
    process.exit(0);
}
check();
