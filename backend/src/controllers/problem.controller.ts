import type { Request, Response } from "express";

import { prisma } from "../libs/prisma.ts";
import {
  getLanguageId,
  poolBatchResults,
  submitBatch,
} from "../libs/judge0.lib.ts";

export const createProblem = async (req: Request, res: Response) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    hints,
    editorial,
    codeSnippets,
    testCases,
    referenceSolutions,
  } = req.body;
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied - Admins only",
      });
    }
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getLanguageId(language);
      if (!languageId) {
        return res.status(400).json({
          error: `Invalid language: ${language}`,
        });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionsResults = await submitBatch(submissions);

      const tokens = submissionsResults.map((r) => r.token);

      const results = await poolBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Reference solution failed for language ${language} on test case ${i + 1}`,
            details: result,
          });
        }
      }
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        hints,
        editorial,
        codeSnippets,
        testCases,
        referenceSolutions,
        userId: req.user.id,
      },
    });
    return res.status(201).json({
      message: "Problem created successfully",
      problem,
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProblems = async (req: Request, res: Response) => {
  try {
    const problems = await prisma.problem.findMany();
    if (!problems) {
      return res.status(404).json({
        message: "No problems found",
      });
    }
    return res.status(200).json({
      messsage: "Problems retrieved successfully",
      problems,
    });
  } catch (error) {
    console.error("Error retrieving problems:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Problem ID is required",
      });
    }
    const problem = await prisma.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }
    return res.status(200).json({
      message: "Problem retrieved successfully",
      problem,
    });
  } catch (error) {
    console.error("Error retrieving problem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProblemById = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      hints,
      editorial,
      codeSnippets,
      testCases,
      referenceSolutions,
    } = req.body;
    const { id } = req.params;
    const problem = await prisma.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getLanguageId(language);
      if (!languageId) {
        return res.status(400).json({
          error: `Invalid language: ${language}`,
        });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionsResults = await submitBatch(submissions);

      const tokens = submissionsResults.map((r) => r.token);

      const results = await poolBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Reference solution failed for language ${language} on test case ${i + 1}`,
            details: result,
          });
        }
      }
    }
    const updatedProblem = await prisma.problem.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        hints,
        editorial,
        codeSnippets,
        testCases,
        referenceSolutions,
      },
    });
    return res.status(200).json({
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    console.error("Error updating problem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProblemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const problem = await prisma.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }
    await prisma.problem.delete({
      where: {
        id,
      },
    });
    return res.status(200).json({
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProblemsSolvedByUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const problems = await prisma.problem.findMany({
      where:{
        solvedBy:{
          some:{
            userId:req.user?.id
          }
        }
      },
      include:{
        solvedBy:{
          where:{
            userId:req.user?.id
          }
        }
      }
    })
    res.status(200).json({
      success:true,
      message:"Problem fetched successfully",
      problems
    })
  } catch (error) {
     console.error("Error fethcing  problem solved by user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
