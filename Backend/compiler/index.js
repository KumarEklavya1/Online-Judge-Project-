import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import generateFile from "./generateFile.js";
import executeCpp from "./executeCpp.js";
import generateInputFile from "./generateInputFile.js";
import aiCodeReview from "./aicodereview.js";

const app = express();

dotenv.config();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        online: "compiler",
    });
});

app.post("/run", async (req, res) => {
    // Default to 2000ms if not provided
    const { language = "cpp", code, input = "", timeLimit = 2000 } = req.body;

    if (!code) return res.status(400).json({ success: false, error: "Empty code!" });

    try {
        const filePath = generateFile(language, code);
        const inputFilePath = generateInputFile(input);
        const output = await executeCpp(filePath, inputFilePath, timeLimit);
        res.json({ success: true, filePath, output });
    } catch (error) {
        res.status(500).json({ success: false, error: error.error, stderr: error.stderr });
    }
});

app.post("/ai-review", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            error: "Empty code!",
        });
    }

    try {
        const review = await aiCodeReview(code);

        res.json({
            success: true,
            review,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message || error.toString(),
        });
    }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});