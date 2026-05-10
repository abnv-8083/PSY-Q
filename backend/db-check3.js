import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject_id: { type: String }
}, { strict: false });
const Test = mongoose.model('Test', testSchema);

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const tests = await Test.find();
    let withSubject = 0;
    let withoutSubject = 0;
    tests.forEach(t => {
        if (t.subject_id) withSubject++;
        else withoutSubject++;
    });
    console.log(`With subject: ${withSubject}, Without subject: ${withoutSubject}`);
    const withSubj = await Test.find({subject_id: {$exists: true}});
    if (withSubj.length > 0) {
        console.log("Example with subject:");
        console.log(withSubj[0]);
    }
    process.exit(0);
}
check();
