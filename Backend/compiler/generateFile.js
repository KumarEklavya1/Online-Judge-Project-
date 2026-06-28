import fs from "fs";
import path from "path";
import crypto from "crypto";

const dirCodes = path.join(process.cwd(), "codes");

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}// using this as i am using import method

const generateFile = (language, code) => {
    const jobId = crypto.randomUUID();

    const fileName = `${jobId}.${language}`;
    const filePath = path.join(dirCodes, fileName);

    fs.writeFileSync(filePath, code);

    return filePath;
};

export default generateFile;