import dotenv from 'dotenv';
import { sendEmail } from '../utils/emailService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
    try {
        console.log("Testing Resend API with default configurations...");
        const result = await sendEmail({
            to: 'test@example.com', // Dummy email to see if API accepts the request
            subject: 'Test Email via Resend',
            html: '<p>This is a test email sent from PSY-Q via Resend!</p>'
        });
        console.log("✅ Success:", result);
    } catch (e) {
        console.error("❌ Failed:", e);
    }
}

test();
