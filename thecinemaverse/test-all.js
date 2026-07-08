const https = require("https");
const testUrl = (url) => {
  https.get(url, (res) => {
    let data = "";
    console.log(`[${url}] Status Code:`, res.statusCode);
    res.on("data", (chunk) => data += chunk);
    res.on("end", () => console.log(`[${url}] Body length:`, data.length, data.slice(0, 100)));
  }).on("error", (err) => console.error(`[${url}] Error:`, err.message));
};

testUrl("https://thecinemaverses.in/");
testUrl("https://thecinemaverses.in/blog");
testUrl("https://thecinemaverses.in/cast");
