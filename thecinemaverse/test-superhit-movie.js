const mongoose = require("mongoose");
const uri = "mongodb://manupradhan7887:manu123@ac-disxnbk-shard-00-00.taqqdhs.mongodb.net:27017,ac-disxnbk-shard-00-01.taqqdhs.mongodb.net:27017,ac-disxnbk-shard-00-02.taqqdhs.mongodb.net:27017/?ssl=true&replicaSet=atlas-xqif1e-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(uri).then(async () => {
  const movie = await mongoose.connection.db.collection("movies").findOne({ slug: "super-hit-2026-movie-details" });
  console.log("Found super-hit movie in MANU DB:", !!movie);
  mongoose.disconnect();
}).catch(console.error);
