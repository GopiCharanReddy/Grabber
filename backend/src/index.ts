import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/user.route";
import videoRoute from "./routes/video.route";
import connectDB from "./db/indexdb";
import cors from 'cors';

dotenv.config();

const app = express();
const router = express.Router();
app.use(express.json())
app.use(cors())

const PORT: number = parseInt(process.env.PORT || '3000', 10)
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
  });
})

app.use("/api/v1", router);
router.use("/user", userRoute);
router.use("/video", videoRoute);