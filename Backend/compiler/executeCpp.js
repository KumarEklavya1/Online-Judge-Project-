import { exec } from "child_process";
import fs from "fs";
import path from "path";

const outputPath = path.join(process.cwd(), "outputs");

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Now accepts a timeLimit parameter
const executeCpp = (filePath, inputFilePath, timeLimit) => {
    const jobId = path.basename(filePath).split(".")[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);

    return new Promise((resolve, reject) => {
        // STEP 1: Compile the code
        exec(`g++ "${filePath}" -o "${outPath}"`, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                reject({ error: "Compilation Error", stderr: compileStderr });
                return;
            }

            // STEP 2: Execute with timeout protection
            exec(
                `"${outPath}" < "${inputFilePath}"`, 
                { timeout: timeLimit }, 
                (runError, runStdout, runStderr) => {
                    if (runError) {
                        if (runError.killed) {
                            reject({ error: "Time Limit Exceeded", stderr: `Took longer than ${timeLimit}ms.` });
                        } else {
                            reject({ error: "Runtime Error", stderr: runStderr });
                        }
                        return;
                    }
                    resolve(runStdout);
                }
            );
        });
    });
};

export default executeCpp;