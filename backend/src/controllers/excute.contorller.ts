import type { Request, Response } from "express";

import { prisma } from "../libs/prisma.ts";
import { getLanguageName, poolBatchResults, submitBatch } from "../libs/judge0.lib.ts";
import { status } from "../generated/prisma/enums.ts";



export const executeCode = async (req: Request, res: Response) => {
  try {
    const { source_code, language_id, stdin, expected_output, problemId } =
      req.body;

    console.log(typeof(language_id))
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      !Array.isArray(stdin) ||
      !Array.isArray(expected_output) ||
      stdin.length !== expected_output.length || stdin.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid or Missing test cases",
      });
    }

    const submisson = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    //send batch submission to judge0 and get tokens
    const submissionResponse = await submitBatch(submisson);

    //extract tokens from the response
    const tokens = submissionResponse.map((r) => r.token);
    
    //poll for results using the tokens
    const results = await poolBatchResults(tokens);

    //analyze results and compare with expected output
    let allPassed = true
    const detailedResults = results.map((result, index) => {
        const stdout = result.stdout?.trim();
        const expected = expected_output[index]?.trim();
        const passed = stdout === expected;
        
        if (!passed) {
            allPassed = false;
        }

        return {
            testCase: index + 1,
            passed,
            stdout,
            expected,
            stderr: result.stderr || null,
            compile_output: result.compile_output || null,
            status: result.status.description,
            memory:result.memory ? `${result.memory} KB` : null,
            time: result.time ? `${result.time} sec` : null,
        };
    }
    );

    console.log(detailedResults);

/*
    detailedResults
    --------------
    {
    testCase: 5,
    passed: true,
    stdout: '8',
    expected: '8',
    stderr: null,
    compile_output: null,
    status: 'Accepted',
    memory: '7908 KB',
    time: '0.049 sec'
  }
*/
    //store submission summary
    const submission = await prisma.submission.create({
        data:{
            userId,
            problemId,
            sourceCode: source_code,
            language: getLanguageName(language_id),
            status: allPassed ? status.ACCEPTED : status.REJECTED,
            compileOutput: detailedResults.some(r => r.compile_output) ? JSON.stringify(detailedResults.map(r=>r.compile_output)) : null,
            memory:detailedResults.some(r=>r.memory) ? JSON.stringify(detailedResults.map(r=>r.memory)) : null,
            time: detailedResults.some(r=>r.time) ? JSON.stringify(detailedResults.map(r=>r.time)) : null,
            stderr: detailedResults.some(r=>r.stderr) ? JSON.stringify(detailedResults.map(r=>r.stderr)) : null,
            stdin: stdin.join("\n"),
            stdout: JSON.stringify(detailedResults.map(r=>r.stdout)),
        }
    })

    if (allPassed){
        await prisma.problemSolved.upsert({
            where:{
                userId_problemId:{
                    userId,
                    problemId,
                }
            },
            update:{},
            create:{
                userId,
                problemId,
            }
        })
    }

    // save individual test cases now

    const testCaseResults = detailedResults.map((result)=>({
        submissionId:submission.id,
        testCase:result.testCase,
        passed:result.passed,
        stdout:result.stdout,
        exceptedOutput:result.expected,
        stderr:result.stderr,
        compileOutput:result.compileOutput,
        status:result.status == "Accepted" ? status.ACCEPTED : status.REJECTED,
        memory:result.memory,
        time:result.time
    }))
    
    await prisma.testCaseResult.createMany({
        data:testCaseResults
    })


    const submissionWithTestcases = await prisma.submission.findUnique({
        where:{
            id:submission.id
        },
        select:{
            testCasesResults:true
        }
    })

    return res.status(200).json({
    success:true,
    message:"Code Excuted! Successfully!",
    submission:submissionWithTestcases
    });

  } catch (error) {
    console.error("Error executing code:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
