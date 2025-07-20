import { promisify } from "util";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const execPromise = promisify(exec);
const YTDLP_EXECUTABLE_PATH = "./bin/yt-dlp";

const runCommand = async (command: string[]): Promise<string> => {
  try {
    // Build extraArgs (like --cookies)
    const extraArgs: string[] = [];

    const cookiesPath = process.env.COOKIES_PATH;
    if (cookiesPath && fs.existsSync(cookiesPath)) {
      extraArgs.push("--cookies", cookiesPath);
    }

    const fullCommand = [
      "python3",
      YTDLP_EXECUTABLE_PATH,
      ...extraArgs,
      ...command,
    ].join(" ");

    console.log(`Attempting to execute: ${fullCommand}`);

    const { stdout, stderr } = await execPromise(fullCommand);

    if (stderr) {
      console.error("stderr: ", stderr);
    }

    return stdout;
  } catch (error: unknown) {
    let errorMessage = error;
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error executing command: ", errorMessage);
    throw error;
  }
};
// Testing of runCommand
/*
(async () => {
  try {
    const result = await runCommand(["--version"]);
    console.log("Command executed successfully:\n", result);
  } catch (error) {
    console.error("Failed to execute command.");
  }
})();
*/

export default runCommand;