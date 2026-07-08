import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "delivery-boy-pizza-on-time-2026-ott-release-shemaroome";
    
    await connectDB();
    
    const blog = await Blog.findOne({ slug }).lean();
    
    return NextResponse.json({
      success: true,
      blogFound: !!blog,
      blogTitle: blog ? blog.title : null
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
