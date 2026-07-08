const mongoose = require("mongoose");
const uri = "mongodb://manupradhan7887:manu123@ac-disxnbk-shard-00-00.taqqdhs.mongodb.net:27017,ac-disxnbk-shard-00-01.taqqdhs.mongodb.net:27017,ac-disxnbk-shard-00-02.taqqdhs.mongodb.net:27017/?ssl=true&replicaSet=atlas-xqif1e-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(uri).then(async () => {
  console.log("Connected to MANU DB");
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  const moviesCount = await mongoose.connection.db.collection("movies").countDocuments();
  console.log("Movies count:", moviesCount);
  const movies = await mongoose.connection.db.collection("movies").find().limit(5).toArray();
  console.log("Movies:", movies.map(m => m.slug));
  const blogsCount = await mongoose.connection.db.collection("blogs").countDocuments();
  console.log("Blogs count:", blogsCount);
  const blogs = await mongoose.connection.db.collection("blogs").find().limit(5).toArray();
  console.log("Blogs:", blogs.map(b => b.slug));
  mongoose.disconnect();
}).catch(console.error);
