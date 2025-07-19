import { promisify } from "util";
import { exec } from "child_process";

const execPromise = promisify(exec);
const YTDLP_EXECUTABLE_PATH = "/root/.local/bin/yt-dlp";

const runCommand = async (command: string[]): Promise<string> => {
  try {
    console.log(
      `Attempting to execute: ${YTDLP_EXECUTABLE_PATH} with args: ${JSON.stringify(
        command
      )}`
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
// Testing of runCommand
/**
(async() => {
  try{
    const result = await runCommand('yt-dlp --version')
    console.log('Command executed successfully.')
  } catch(error) {
   console.error('Failed to execute command.') 
  }
})();
 */

export default runCommand;
