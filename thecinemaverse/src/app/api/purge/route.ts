import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidatePath("/", "layout");
  return NextResponse.json({ success: true, message: "Cache purged globally" });
}
