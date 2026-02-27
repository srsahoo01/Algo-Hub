import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.ts"
import { addProblemToPlaylist, createPlaylist, deletePlaylist, getAllListDetails, getPlaylistDetailsById, removeProblemFromPlaylist } from "../controllers/playlist.controller.ts"

const playlistRouts = express.Router()

playlistRouts.get("/",authMiddleware,getAllListDetails)


playlistRouts.get("/:playlistId",authMiddleware,getPlaylistDetailsById)


playlistRouts.post("/create-playlist",authMiddleware,createPlaylist)

playlistRouts.post("/:playlistId/add-problem",authMiddleware,addProblemToPlaylist)

playlistRouts.delete("/:playlistId/remove-problem",authMiddleware,removeProblemFromPlaylist)

playlistRouts.delete("/:playlistId",authMiddleware,deletePlaylist)


export default playlistRouts