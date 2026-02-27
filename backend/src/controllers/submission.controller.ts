import type { Request, Response } from "express"

import { prisma } from "../libs/prisma.ts"

export const getAllSubmisson = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const submissions = await prisma.submission.findMany({
            where: {
                userId
            }
        })
        return res.status(200).json({
            succcess: true,
            message: "All submissions fetched successfully",
            submissions: submissions
        })
    } catch (error) {
        console.error("Error fetching submissions:", error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching submissions"
        })
    }
}

export const getSubmissionByProblemId = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id
        const problemId = req.params?.problemId

        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required" })
        }
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const submissions = await prisma.submission.findMany({
            where: {
                userId,
                problemId
            }
        })

        return res.status(200).json({
            success: true,
            message: "Submissions fetched successfully",
            submissions: submissions
        })
    } catch (error) {
        console.error("Error fetching submissions by problem id:", error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching submissions by problem id"
        })
    }
}

export const getAllTheSubmissionCountByProblemId = async (req: Request, res: Response) => {
    try {
        const problemId = req.params?.problemId

        if (!problemId) {
            return res.status(400).json({ message: "Problem ID is required" })
        }

        const submissionCount = await prisma.submission.count({
            where: {
                problemId
            }
        })

        return res.status(200).json({
            success: true,
            message: "Submission count fetched successfully",
            submissionCount: submissionCount
        })
    } catch (error) {
        console.error("Error fetching submission count by problem id:", error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching submission count by problem id"
        })
    }
}