import express from "express";
import cookieParser from 'cookie-parser';

import env from "./config.ts";
import authRoutes from "./routes/auth.routes.ts";
import problemRoutes from "./routes/problem.routes.ts";
import executeRoutes from "./routes/execute-routes.ts";
import submissionRoutes from "./routes/submission-routes.ts";


const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/problems', problemRoutes)
app.use('/api/v1/execute', executeRoutes)
app.use('/api/v1/submission', submissionRoutes)

app.listen(env.PORT,()=>{
    console.log(`App is listening on the port ${env.PORT}`)
})


