import { NextRequest, NextResponse } from "next/server";
import { submitToGoogleIndexingApi } from "@/lib/google-indexing";

const INDEXNOW_KEY = "7f8a9c2b4d1e3f5a6c8b0d2e4f6a8c0b";
const HOST = "thecinemaverses.in";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate request
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
    }

    // Optional: You should add a secret token check here to prevent unauthorized users from abusing your API
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.INDEXING_API_SECRET || "default_dev_secret"}`) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: Record<string, any> = { url };

    // 2. Submit to IndexNow (Bing, Yandex, Seznam, Naver)
    try {
      const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          host: HOST,
          key: INDEXNOW_KEY,
          keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
          urlList: [url],
        }),
      });
      
      if (indexNowRes.ok) {
        results.indexNow = "Success";
      } else {
        results.indexNow = `Failed with status: ${indexNowRes.status}`;
      }
    } catch (err: any) {
      results.indexNow = `Error: ${err.message}`;
    }

    // 3. Submit to Google Indexing API
    try {
      const googleRes = await submitToGoogleIndexingApi(url);
      if (googleRes) {
        results.google = "Success";
      } else {
        results.google = "Skipped (Credentials not configured)";
      }
    } catch (err: any) {
      results.google = `Error: ${err.message}`;
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
