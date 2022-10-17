import { MongoClient } from 'mongodb';

const dbHost = process.env.DDBB_HOST ?? 'localhost:27017';
const dbUser = process.env.DDBB_USER ?? null;
const dbPass = process.env.DDBB_PASS ?? null;
const dbName = process.env.DDBB_NAME ?? 'pokeGenAI';

const userSegment = dbUser ? `${dbUser}:${dbPass}@` : '';
const mongoUri = `mongodb://${userSegment}${dbHost}/${dbName}`;

const client = new MongoClient(mongoUri);

const connectDB = async () => {
  await client.connect();
  const db = client.db(dbName);

  console.log('Connected successfully to mongodb server');

  const collection = db.collection('tweets');
  await collection.createIndex({ createdAt: 1, user: 1 });

  return collection;
};

const getUserDailyTweets = async (collection, userId) => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const dailyTweets = await collection.count({
    createdAt: { $gte: startDate, $lt: endDate },
    'user.userId': userId,
  });

  return dailyTweets;
};

export { connectDB, getUserDailyTweets };
