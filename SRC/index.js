import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
    path:'./env'
})
connectDB()









// ;(async () => {
//     try {
//         awaitc
//     } catch (error) {
//         console.error("Error:",error)
//         throw error
//     }
// })()