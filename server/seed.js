import 'dotenv/config';
import { connectDb, seedIfEmpty, mongoReady } from './db.js';

await connectDb();
if (!mongoReady) {
  console.error('Set MONGODB_URI before seeding.');
  process.exit(1);
}
await seedIfEmpty();
process.exit(0);
