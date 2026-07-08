const https = require("https");
https.get("https://thecinemaverses.in/api/news", (res) => {
  let data = "";
  console.log("Status Code:", res.statusCode);
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log("Body:", data));
}).on("error", (err) => console.error("Error:", err.message));
