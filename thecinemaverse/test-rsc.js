const https = require("https");
const testRsc = (url) => {
  const req = https.request(url, {
    headers: {
      "RSC": "1",
      "Next-Router-State-Tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D"
    }
  }, (res) => {
    let data = "";
    console.log(`[${url}] RSC Status Code:`, res.statusCode);
    res.on("data", (chunk) => data += chunk);
    res.on("end", () => {
      console.log(`[${url}] RSC Body length:`, data.length);
      if (res.statusCode >= 500) {
        console.log(`[${url}] RSC Error Body:`, data.slice(0, 500));
      }
    });
  });
  req.on("error", (err) => console.error(`[${url}] Error:`, err.message));
  req.end();
};
testRsc("https://thecinemaverses.in/movie/daman-2022");
testRsc("https://thecinemaverses.in/news");
