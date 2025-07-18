import { Request, Response, NextFunction, Router } from "express";
import runCommand from "./video";
import verifyJWT from "../middleware/auth.middleware";

const route = Router();

const isValidUrl = (url: string) => {
  if (
    /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(
      url
    )
  ) {
    return true;
  }
  return false;
};

export interface VideoFormatForFrontend {
  formatId: string;
  extension: string;
  quality: string;
  fileSize: number;
  type: "video" | "audio" | "video+audio";
}

route.post(
  "/info",
  verifyJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ message: "Url not found." });
        return;
      }
      const validUrl = isValidUrl(url);
      if (!validUrl) {
        res.status(400).json({ message: "Invalid Url provided." });
        return;
      }
      const data = await runCommand(["-J", url]);
      const parsedData = JSON.parse(data);

      const title = parsedData.title;
      const duration = parsedData.duration;
      let thumbnail = parsedData.thumbnail;

      if (
        !thumbnail &&
        parsedData.thumbnails &&
        parsedData.thumbnails.length > 0
      ) {
        thumbnail = parsedData.thumbnails[parsedData.thumbnails.length - 1].url;
      } else if (!thumbnail) {
        thumbnail = "https://via.placeholder.com/150";
      }

      const filteredAndMappedFormats = parsedData.formats
        .filter((format: any) => {
          return (
            format.url &&
            !format.format_note?.includes("storyboard") &&
            (format.filesize || format.filesize_approx) &&
            (format.vcodec !== "none" || format.acodec !== "none")
          );
        })
        .map((format: any) => {
          let quality: string;
          let type: "video" | "audio" | "video+audio";

          if (format.vcodec !== "none" && format.acodec !== "none") {
            type = "video+audio";
            quality = format.height
              ? `${format.height}p`
              : format.format_note || format.format_id;
          } else if (format.vcodec !== "none") {
            type = "video";
            quality = format.height
              ? `${format.height}p (Video-only)`
              : format.format_note || format.format_id + " (Video-only)";
          } else if (format.acodec !== "none") {
            type = "audio";
            quality = format.abr
              ? `${Math.round(format.abr)}kbps (Audio)`
              : format.format_note || format.format_id + " (Audio-only)";
          } else {
            type = "video+audio";
            quality = format.format_note || format.format._id;
          }

          const fileSize = format.filesize || format.filesize_approx || 0;

          return {
            formatId: format.format_id,
            extension: format.ext,
            quality: quality,
            fileSize: fileSize,
            type: type,
          };
        })
        .sort((a: VideoFormatForFrontend, b: VideoFormatForFrontend) => {
          const typeOrder: { [key in VideoFormatForFrontend["type"]]: number } =
            {
              "video+audio": 1,
              video: 2,
              audio: 3,
            };
          if (typeOrder[a.type] !== typeOrder[b.type]) {
            return typeOrder[a.type] - typeOrder[b.type];
          }

          const extractNumber = (str: string) =>
            parseInt(str.split("p")[0] || str.split("kbps")[0]);

          if (a.type === "video" || a.type === "video+audio") {
            const heightA = extractNumber(a.quality);
            const heightB = extractNumber(b.quality);
            if (!isNaN(heightA) && !isNaN(heightB)) return heightB - heightA;
          } else if (a.type === "audio") {
            const abrA = extractNumber(a.quality);
            const abrB = extractNumber(a.quality);
            if (!isNaN(abrA) && !isNaN(abrB)) return abrB - abrA;
          }
          return b.fileSize - a.fileSize;
        });

      res
        .status(200)
        .json({
          title,
          thumbnail,
          duration,
          formats: filteredAndMappedFormats,
        });
    } catch (error: any) {
      console.error("Error while getting Video Info: ", error.message || error);
      if (
        (error.stderr && error.stderr.includes("Unsupported URL")) ||
        error.stderr.includes("No video formats found.")
      ) {
        res.status(400).json({
          message:
            "Could not retrieve video information. Unsupported URL or video not found.",
        });
      } else {
        res
          .status(500)
          .json({
            message: "Internal server error while fetching video info.",
          });
      }
    }
  }
);

export default route;
