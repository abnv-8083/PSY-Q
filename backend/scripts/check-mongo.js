import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log("Connecting to:", uri);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Native driver connected!");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ Native driver failed:", err);
  } finally {
    await client.close();
  }
}
run();
