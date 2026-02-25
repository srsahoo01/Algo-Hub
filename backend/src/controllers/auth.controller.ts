import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import type {
  RegisterBody,
  LoginBody,
  
} from "../types/authTypes.ts";
import { prisma } from "../libs/prisma.ts";
import { UserRole } from "../generated/prisma/enums.ts";
import env from "../config.ts";

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        role: UserRole.USER,
      },
    });

    const token = jwt.sign({ id: newUser.id }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!existingUser) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: existingUser.id }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    res.cookie("token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        role: existingUser.role,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      error: "Server error",
    });
  } 
};

export const check = (req: Request, res: Response) => {
  try {
    res.status(200).json({
        success: true,
        message: "User is authenticated",
    });
  } catch (error) {
    
  }
};
