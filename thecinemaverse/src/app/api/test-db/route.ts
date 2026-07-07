import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      return NextResponse.json({ 
        success: false, 
        error: "MONGODB_URI is undefined! The environment variable was not found in process.env" 
      });
    }

    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Successfully connected to MongoDB!" 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}
