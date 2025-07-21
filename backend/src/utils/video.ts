import { promisify } from "util";
import { exec } from "child_process";

const execPromise = promisify(exec);
const YTDLP_EXECUTABLE_PATH = "yt-dlp";

const runCommand = async (command: string[]): Promise<string> => {
  try {
    console.log(
      `Attempting to execute: ${YTDLP_EXECUTABLE_PATH} with args: ${JSON.stringify(command)}`
    );

    const { stdout, stderr } = await execPromise(
      `${YTDLP_EXECUTABLE_PATH} ${command.join(" ")}`
    );

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