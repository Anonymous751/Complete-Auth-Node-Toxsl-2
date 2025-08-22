import mongoose from "mongoose";

const connectDB = async (DATABASE_URI) => {
  try {
    const DB_OPTIONS = {
      dbName: "AuthShop",
    };
    await mongoose.connect(DATABASE_URI, DB_OPTIONS);
    console.log("Mongodb Connected Succesfully !...");
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;