import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware";
import  {videoInfo, downloadVideo } from "../controller/videoInfo.controller";

const route = Router();

route.post("/info", verifyJWT, videoInfo);
route.get("/download", verifyJWT, downloadVideo)

export default route;