const mongoose = require("mongoose");
const uri = "mongodb://alekhprdhan3305:Alekh3305@ac-p3lqope-shard-00-00.q0oow09.mongodb.net:27017,ac-p3lqope-shard-00-01.q0oow09.mongodb.net:27017,ac-p3lqope-shard-00-02.q0oow09.mongodb.net:27017/?ssl=true&replicaSet=atlas-izhewj-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(uri).then(async () => {
  console.log("Connected to ODIA DB");
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  const moviesCount = await mongoose.connection.db.collection("movies").countDocuments();
  console.log("Movies count:", moviesCount);
  if (moviesCount > 0) {
    const movie = await mongoose.connection.db.collection("movies").findOne();
    console.log("Sample movie:", movie.title, movie.slug);
  }
  mongoose.disconnect();
}).catch(console.error);
