import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function test() {
    console.log('Testing connection to:', process.env.MONGODB_URI);
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Success!');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}
test();
