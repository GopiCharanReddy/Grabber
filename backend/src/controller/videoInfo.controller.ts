import { Request, Response, NextFunction, Router } from "express";
import { YtDlpRawFormat } from "../types/yt-dlp";
import runCommand from "../utils/video";
import fs from "fs";
import path from "path";
import { spawn, ExecException } from "child_process";

const isValidUrl = (url: string) => {
  if (
    /^(http(s)?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))$/g.test(
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

const videoInfo = async (req: Request, res: Response) => {
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

    const cookiesPath = path.join(__dirname, "cookies.txt");
    const ytdlpArgs = ["-J", url];

    if (fs.existsSync(cookiesPath)) {
      ytdlpArgs.unshift("--cookies", cookiesPath);
    }

    try {
      const data = await runCommand(ytdlpArgs);
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

      // Check if formats exist
      if (!parsedData.formats || !Array.isArray(parsedData.formats)) {
        return res.status(400).json({ 
          message: "No video formats found for this URL." 
        });
      }

    const filteredAndMappedFormats = parsedData.formats
      .filter((format: YtDlpRawFormat) => {
        return (
          format.url &&
          !format.format_note?.includes("storyboard") &&
          (format.filesize || format.filesize_approx) &&
          (format.vcodec !== "none" || format.acodec !== "none")
        );
      })
      .map((format: YtDlpRawFormat) => {
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
            quality = format.format_note || format.format_id;
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
          const typeOrder: { [key in VideoFormatForFrontend["type"]]: number } = {
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
            const abrB = extractNumber(b.quality);
            if (!isNaN(abrA) && !isNaN(abrB)) return abrB - abrA;
          }
          return b.fileSize - a.fileSize;
        });

      if (filteredAndMappedFormats.length === 0) {
        return res.status(400).json({ 
          message: "No suitable video formats found for this URL." 
        });
      }

      return res.status(200).json({
        title,
        thumbnail,
        duration,
        formats: filteredAndMappedFormats,
      });
    } catch (parseError) {
      console.error("Error parsing video data:", parseError);
      return res.status(500).json({ 
        message: "Failed to process video information." 
      });
    }
  } catch (error: unknown) {
    let messageToClient: string =
      "Internal server error while fetching video info.";
    let statusCode: number = 500;

    let stderrContent: string | undefined;

    if (typeof error === "object" && error !== null && "stderr" in error) {
      const potentialStderr = (error as { stderr: unknown }).stderr;
      if (typeof potentialStderr === "string") {
        stderrContent = potentialStderr;
      }
    }

    if (stderrContent) {
      console.error("yt-dlp STDERR:", stderrContent);

      if (
        stderrContent.includes("Unsupported URL") ||
        stderrContent.includes("No video formats found.")
      ) {
        messageToClient =
          "Could not retrieve video information. Unsupported URL or video not found.";
        statusCode = 400;
      }
    } else if (error instanceof Error) {
      console.error("Standard Error:", error.message, error);
    } else {
      console.error("Unknown Error Type:", error);
    }

    return res.status(statusCode).json({ message: messageToClient });
  }
};

const downloadVideo = async (req: Request, res: Response) => {
  const { url, formatId, ext } = req.query;

  console.log("received format id:", formatId);
  if (
    typeof url !== "string" ||
    !url ||
    typeof formatId !== "string" ||
    !formatId ||
    typeof ext !== "string" ||
    !ext
  ) {
    return res
      .status(400)
      .json({ message: "URL, Format ID, and File Extension are required." });
  }

  try {
    const suggestedFileName = `video_download_${Date.now()}.${ext}`;
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${suggestedFileName}"`
    );
    res.setHeader("Content-Type", `video/${ext}`);

    const cookiesPath = path.join(__dirname, "cookies.txt");

    const ytDlpArgs = [
      "-f",
      formatId,
      "-o",
      "-",
      "--merge-output-format",
      "mp4",
      "--",
      url,
    ];

    if (fs.existsSync(cookiesPath)) {
      ytDlpArgs.splice(0, 0, "--cookies", cookiesPath);
    }

    console.log(`Executing yt-dlp command: yt-dlp ${ytDlpArgs.join(" ")}`);

    const ytDlpProcess = spawn("yt-dlp", ytDlpArgs);

    ytDlpProcess.stdout.pipe(res);

    ytDlpProcess.stderr.on("data", (data) => {
      console.error(
        `yt-dlp stderr for ${url} (Format: ${formatId}): ${data.toString()}`
      );
    });

    ytDlpProcess.on("error", (err: ExecException) => {
      console.error(`Failed to start yt-dlp process for ${url}:`, err);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Failed to start video download process on the server.",
        });
      } else {
        res.end(); // Or res.destroy()
      }
    });

    ytDlpProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`yt-dlp process finished successfully for ${url}`);
      } else {
        console.error(
          `yt-dlp process exited with code ${code} for ${url}. Download failed.`
        );
        if (!res.headersSent) {
          res
            .status(500)
            .json({ message: "Video download process failed unexpectedly." });
        } else {
          res.end();
        }
      }
    });

    req.on("aborted", () => {
      console.warn(
        `Client aborted download for ${url}. Killing yt-dlp process.`
      );
      ytDlpProcess.kill();
    });
    res.on("close", () => {
      if (!ytDlpProcess.killed) {
        ytDlpProcess.kill();
        console.log(`yt-dlp process killed due to response close for ${url}.`);
      }
    });
  } catch (error: unknown) {
    let messageToClient: string =
      "Internal server error while downloading video.";
    let statusCode: number = 500;

    if (error instanceof Error) {
      console.error("Download Error:", error.message, error);
    } else {
      console.error("Unknown Download Error Type:", error);
    }

    if (!res.headersSent) {
      return res.status(statusCode).json({ message: messageToClient });
    }
  }
};

export { videoInfo, downloadVideo };