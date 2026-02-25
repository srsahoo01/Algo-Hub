import express from "express";
import cookieParser from 'cookie-parser';

import env from "./config.ts";
import authRoutes from "./routes/auth.routes.ts";


const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1/auth',authRoutes)

app.listen(env.PORT,()=>{
    console.log(`App is listening on the port ${env.PORT}`)
})


