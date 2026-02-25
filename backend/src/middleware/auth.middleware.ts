import jwt from "jsonwebtoken";
import type { Response, Request, NextFunction } from "express";

import type { User } from "../generated/prisma/client.ts";
import { prisma } from "../libs/prisma.ts";
import env from "../config.ts";
import type {  jwtPayload } from "../types/authTypes.ts";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }
   
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwtPayload;
    const user: User | null = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({
        error: "Unauthorized - User not found",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      error: "Unauthorized - Invalid token",
    });
  }
};
