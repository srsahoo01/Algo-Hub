import type { Request, Response } from "express";
import { prisma } from "../libs/prisma.ts";

export const getAllListDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const playlists = await prisma.playlist.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        problemsInPlayList: {
          include: {
            problem_relation: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.log("error fetching playlists", error);
    res.status(500).json({ message: "Error fetching playlists" });
  }
};

export const getPlaylistDetailsById = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const playlist = await prisma.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user?.id,
      },
      include: {
        problemsInPlayList: {
          include: {
            problem_relation: true,
          },
        },
      },
    });
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist details fetched successfully",
      playlist,
    });
  } catch (error) {
    console.log("error fetching playlist details by id", error);
    res.status(500).json({ message: "Error fetching playlist details" });
  }
};

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(201).json({
      succcess: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.log("error creating playlist", error);
    res.status(500).json({ message: "Error creating playlist" });
  }
};

export const addProblemToPlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;
    const { problemIds } = req.body;
    const userId = req.user?.id;
    if (!playlistId) {
      return res.status(401).json({
        message: "Playlist id is missing",
      });
    }
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!Array.isArray(problemIds) || problemIds.length == 0) {
      return res.status(400).json({
        message: "Invalid or missing problemsId",
      });
    }

    const problemsInPlayList = await prisma.problemsInPlaylist.createMany({
      data: problemIds.map((problemId) => {
        (playlistId, problemId);
      }),
    });

    res.status(201).json({
      success: true,
      message: "Porblem added to playlist successfully",
      problemsInPlayList,
    });
  } catch (error) {
    console.log("Error in the addProblemPlaylist controller ", error);
    return res.status(500).json({
      message: "Problem in add problem to playlust",
    });
  }
};

export const removeProblemFromPlaylist = async (
  req: Request,
  res: Response,
) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  const userId = req.user?.id;
  if (!playlistId) {
    return res.status(401).json({
      message: "Playlist id is missing",
    });
  }
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!Array.isArray(problemIds) || problemIds.length == 0) {
    return res.status(400).json({
      message: "Invalid or missing problemsId",
    });
  }
  try {
    const deletedProblem = await prisma.problemsInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
      deletedProblem,
    });
  } catch (error) {
    console.error("Error removing problem from playlist:", error);
    res.status(500).json({ error: "Failed to remove problem from playlist" });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId } = req.params;

    const deletedPlaylist = await prisma.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "playlist deleted successfulyy",
      deletePlaylist,
    });
  } catch (error) {
    console.log("Error in the delePlaylist ", error);
    return res.status(500).json({
      message: "Problem in delting Playlist",
    });
  }
};
