const https = require("https");

const testUrl = (url) => {
  https.get(url, (res) => {
    let data = "";
    console.log(`[${url}] Status Code:`, res.statusCode);
    res.on("data", (chunk) => data += chunk);
    res.on("end", () => {
      console.log(`[${url}] Body length:`, data.length);
      if (res.statusCode >= 500) {
        console.log(`[${url}] Error Body:`, data.slice(0, 1000));
      }
    });
  }).on("error", (err) => console.error(`[${url}] Error:`, err.message));
};

testUrl("https://thecinemaverses.in/blog/top-10-bbollywood-movies-all-time");
testUrl("https://thecinemaverses.in/movie/daman-2022");
testUrl("https://thecinemaverses.in/movie/daman");
