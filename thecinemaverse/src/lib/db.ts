import mongoose from "mongoose";

let cached = (globalThis as any).mongoose;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null, listenerAdded: false };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable in .env.local");
  }

  if (!cached.listenerAdded) {
    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error caught:", err);
      cached.promise = null;
      cached.conn = null;
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose disconnected");
      cached.promise = null;
      cached.conn = null;
    });
    cached.listenerAdded = true;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
