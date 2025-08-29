import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const mongoClient = new MongoClient(uri);
let isConnected = false;
export async function connectDB() {
  if (!isConnected) {
    await mongoClient.connect();
    isConnected = true;
  }
  return mongoClient.db(); // default DB from connection string
}