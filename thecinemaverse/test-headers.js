const https = require("https");
const testHeaders = (url) => {
  https.get(url, (res) => {
    console.log(`[${url}] Status Code:`, res.statusCode);
    console.log(`[${url}] Headers:`, JSON.stringify(res.headers, null, 2));
    res.resume(); // consume response data to free up memory
  }).on("error", (err) => console.error(`[${url}] Error:`, err.message));
};
testHeaders("https://thecinemaverses.in/blog/super-hit-2026-movie-details");
testHeaders("https://thecinemaverses.in/movie/daman-2022");
