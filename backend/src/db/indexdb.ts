import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionDB = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
    console.log(`\n MongoDB connected successfully !! DB HOST: ${connectionDB.connection.host}`);
  } catch (error) {
    console.log("MongoDb connection Error: ", error)
    process.exit(1)
  }
};


export default connectDB