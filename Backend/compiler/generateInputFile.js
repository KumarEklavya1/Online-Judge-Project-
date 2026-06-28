import fs from "fs";
import path from "path";
import crypto from "crypto";

const dirInputs = path.join(process.cwd(), "inputs");

if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = (input) => {
    const jobId = crypto.randomUUID();

    const inputFileName = `${jobId}.txt`;
    const inputFilePath = path.join(dirInputs, inputFileName);

    fs.writeFileSync(inputFilePath, input);

    return inputFilePath;
};

export default generateInputFile;