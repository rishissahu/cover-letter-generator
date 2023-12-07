const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
dotenv.config();

const app = express();
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_SECRET
});

const PORT = process.env.PORT || 8001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public'));

app.post('/generate-cover-letter', upload.single('resume'), async (req, res) => {
    const tag = "Generate-cover-letter";
    console.log(tag);

    if (!req.body.jobDescription || !req.file) {
        res.status(400).json({ error: 'Please fill in the job description and upload a resume.' });
        return;
    }

    try {
        const jobDescription = req.body.jobDescription;
        const resumeBuffer = req.file.buffer;

        const resumeText = await extractTextFromPDF(resumeBuffer);
        const coverLetter = await generateCoverLetter(jobDescription, resumeText);

        res.status(200).json({ coverLetter });
    } catch (error) {
        console.error("Error:", error);

        if (error instanceof OpenAI.errors.RateLimitError) {
            res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

async function extractTextFromPDF(pdfBuffer) {
    const data = await pdf(pdfBuffer);
    return data.text;
}

async function generateCoverLetter(jobDescription, resumeText) {
    const prompt = `Generate a cover letter for the following job:
    Resume Details: ${resumeText}
    Job Description: ${jobDescription}
    
    do not include from, to insted directly start from "dear hiring team",

    Generate the cover letter accordingly. within 1000 characters
    `;

    console.log("Prompt Length -> ", prompt.length);

    try {
        const response = await aiCall(prompt);
        console.log(response);
        return response.message.content;
    } catch (error) {
        console.error("AI Call Error:", error);
        return "Something went wrong";
    }
}

async function aiCall(prompt) {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0];
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
