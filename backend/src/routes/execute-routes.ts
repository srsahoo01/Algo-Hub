import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { executeCode } from "../controllers/excute.contorller.ts";


const executeRoutes = express.Router();

executeRoutes.post("/executeCode",authMiddleware,executeCode)

export default executeRoutes;