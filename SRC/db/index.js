import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
const connectDB = async () => {
    try {
    const connectionInstant = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(`DB connected on host:${connectionInstant.connection.host}`)
    } catch (error) {
        console.log("ERROR:",error)
        process.exit(1);
    }
}
export default connectDB;