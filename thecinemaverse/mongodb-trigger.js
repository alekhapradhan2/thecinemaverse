exports = async function(changeEvent) {
  // A MongoDB Trigger that fires when a document is INSERTED.
  // It calls your Next.js API to instantly index the new page on Google and Bing.

  // 1. Only run for new inserts
  if (changeEvent.operationType !== "insert") {
    return;
  }

  const doc = changeEvent.fullDocument;
  const collectionName = changeEvent.ns.coll;
  
  // Replace this with your actual domain
  const BASE_URL = "https://thecinemaverses.in";
  // The secret you set in your Next.js environment variables
  const API_SECRET = "my_super_secret_password_123"; 

  let pageUrl = "";

  // 2. Determine the URL based on which collection was updated
  if (collectionName === "movies" && doc.slug) {
    pageUrl = `${BASE_URL}/movie/${doc.slug}`;
    
  } else if (collectionName === "blogs" && doc.slug) {
    pageUrl = `${BASE_URL}/blog/${doc.slug}`;
    
  } else if (collectionName === "casts" && doc._id) {
    pageUrl = `${BASE_URL}/cast/${doc._id.toString()}`;
    
  } else {
    // If it's a collection we don't care about, ignore it.
    console.log(`Skipping indexing for collection: ${collectionName}`);
    return;
  }

  console.log(`Triggering instant indexing for: ${pageUrl}`);

  // 3. Ping your Next.js API endpoint
  try {
    const response = await context.http.post({
      url: `${BASE_URL}/api/index-url`,
      headers: {
        "Content-Type": ["application/json"],
        "Authorization": [`Bearer ${API_SECRET}`]
      },
      body: JSON.stringify({ url: pageUrl })
    });

    console.log(`API Response Status: ${response.statusCode}`);
    console.log(`API Response Body: ${response.body.text()}`);
    
  } catch (error) {
    console.error(`Failed to trigger index API: ${error.message}`);
  }
};
