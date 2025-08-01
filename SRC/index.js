import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './db/index.js';
dotenv.config({
    path:".env"
})
connectDB()//promise
.then(()=>{
    app.listen(process.env.PORT,()=>{
    console.log(`connected to server at port: ${process.env.PORT}`)
})
})
.catch((error)=>{
    console.log("Failed to connect:",error)
})