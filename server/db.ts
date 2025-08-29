import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = "mongodb+srv://securebank69_db_user:DGwUstsGEMZJPqMs@spb.qjigdqa.mongodb.net/secure-pb?retryWrites=true&w=majority&appName=SPB";

export const mongoClient = new MongoClient(mongoUri);
let isConnected = false;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (!isConnected) {
    await mongoClient.connect();
    db = mongoClient.db("secure-pb");
    isConnected = true;
    console.log("Connected to MongoDB successfully");
  }
  return db;
}