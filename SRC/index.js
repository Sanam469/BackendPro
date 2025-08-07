import {app} from "./app.js"
import dotenv from "dotenv";
import connectDb from "./db/index.js";
dotenv.config({
    path:"./.env"
})
connectDb()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`connected to port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb connection failed",err)
})