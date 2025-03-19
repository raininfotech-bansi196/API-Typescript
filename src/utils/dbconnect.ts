import mongoose, { Mongoose } from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL: any | undefined = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error('Please define the MONGODB_URL environment variable inside .env.local');
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

interface GlobalWithMongoose {
  mongoose?: MongooseCache;
}

declare const global: GlobalWithMongoose;

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', false);
    cached.promise = mongoose.connect(MONGODB_URL).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

global.mongoose = cached;

// module.exports = dbConnect;
