import { google } from "googleapis";

/**
 * Submit a URL to the Google Indexing API.
 * 
 * Note: Requires GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables
 * from a Google Cloud Service Account that has been added as an Owner in Google Search Console.
 */
export async function submitToGoogleIndexingApi(url: string, type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED") {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"); // Handle newline escapes in env vars

  if (!clientEmail || !privateKey) {
    console.warn("Google Indexing API credentials missing. Skipping Google ping.");
    return null;
  }

  try {
    const jwtClient = new google.auth.JWT(
      clientEmail,
      undefined,
      privateKey,
      ["https://www.googleapis.com/auth/indexing"],
      undefined
    );

    await jwtClient.authorize();

    const indexing = google.indexing({
      version: "v3",
      auth: jwtClient,
    });

    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Google Indexing API Error:", error.message || error);
    throw new Error(`Google Indexing API failed: ${error.message || "Unknown error"}`);
  }
}
