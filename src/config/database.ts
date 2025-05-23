import { connect } from "http2";
import mongoose from "mongoose";


const connectDB= async () => {
    try{
await mongoose.connect(process.env.MONGODB_URI || "",)
        // useCreateIndex: true,
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    console.log("MongoDB is connected!");

    }catch(error){
        console.error('MongoDB unable to connect:', error);
        process.exit(1)
    }
};

export default connectDB;