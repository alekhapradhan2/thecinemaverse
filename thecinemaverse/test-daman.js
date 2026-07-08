const mongoose = require("mongoose");
const uri = "mongodb://manupradhan7887:manu123@ac-disxnbk-shard-00-00.taqqdhs.mongodb.net:27017,ac-disxnbk-shard-00-01.taqqdhs.mongodb.net:27017,ac-disxnbk-shard-00-02.taqqdhs.mongodb.net:27017/?ssl=true&replicaSet=atlas-xqif1e-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(uri).then(async () => {
  const movie = await mongoose.connection.db.collection("movies").findOne({ slug: "daman-2022" });
  console.log("Found daman-2022 in MANU DB:", !!movie);
  const blog = await mongoose.connection.db.collection("blogs").findOne({ slug: "super-hit-2026-movie-details" });
  console.log("Found super-hit in MANU DB:", !!blog);
  
  const movieOdia = await mongoose.connection.db.collection("movies").findOne({ slug: "daman-2022" });
  mongoose.disconnect();
}).catch(console.error);
