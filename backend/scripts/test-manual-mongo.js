import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  // Manual construction from SRV fragments
  const user = "psyqonline_db_user";
  const pass = "jho4MxpBGTLiIDMd";
  const host = "cluster0-shard-00-00.5xvht8o.mongodb.net:27017";
  const uri = `mongodb://${user}:${pass}@${host}/psy-q?ssl=true&authSource=admin&retryWrites=true&w=majority`;
  
  console.log("Connecting manually to:", host);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("✅ Manual connection success!");
  } catch (err) {
    console.error("❌ Manual connection failed:", err.message);
  } finally {
    await client.close();
  }
}
run();
