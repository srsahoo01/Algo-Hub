import express from "express"

import { authMiddleware } from "../middleware/auth.middleware.ts"
import { getAllSubmisson, getAllTheSubmissionCountByProblemId, getSubmissionByProblemId } from "../controllers/submission.controller.ts"

const submissionRoutes = express.Router()

submissionRoutes.get("/get-all-submissions",authMiddleware, getAllSubmisson)
submissionRoutes.get("/get-submission/:problemId",authMiddleware, getSubmissionByProblemId)
submissionRoutes.get("/get-submission-count/:problemId",authMiddleware, getAllTheSubmissionCountByProblemId)


export default submissionRoutes