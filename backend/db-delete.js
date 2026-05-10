import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testSchema = new mongoose.Schema({}, { strict: false });
const Test = mongoose.model('Test', testSchema);
const Question = mongoose.model('Question', new mongoose.Schema({}, { strict: false }));

async function remove() {
    await mongoose.connect(process.env.MONGODB_URI);
    const orphanedId = '69db4e7b542a82f690c9bdca';
    const res = await Test.findByIdAndDelete(orphanedId);
    console.log("Deleted test:", res);
    const qRes = await Question.deleteMany({ test_id: orphanedId });
    console.log("Deleted questions:", qRes.deletedCount);
    process.exit(0);
}
remove();
