const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const Anthropic = require("@anthropic-ai/sdk");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// STEP 1: Photo -> Text (OCR)
app.post("/api/extract-text", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const result = await Tesseract.recognize(req.file.buffer, "eng");
    res.json({ text: result.data.text.trim() });
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: "Failed to extract text from image" });
  }
});

// STEP 2: Text -> Quiz, flashcards, explanation
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { text, chapter, subtopic } = req.body;
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Text is too short to work with" });
    }

    const prompt = `
You are a study assistant for an ICSE board student. Below is the EXACT text from their
textbook for the chapter "${chapter || "Unknown"}", subtopic "${subtopic || "Unknown"}".

TEXTBOOK TEXT:
"""
${text}
"""

Using ONLY the content above, generate a JSON object (and nothing else, no markdown fences)
with this exact structure:

{
  "simple_explanation": "...",
  "fun_fact": "...",
  "mcqs": [{ "question": "...", "options": ["A","B","C","D"], "answer": "A" }],
  "short_answer_questions": ["...", "..."],
  "long_answer_questions": ["...", "..."],
  "one_word_answers": [{ "question": "...", "answer": "..." }],
  "fill_in_the_blanks": [{ "sentence_with_blank": "...", "answer": "..." }],
  "flashcards": [{ "front": "...", "back": "..." }],
  "verbatim_recall_passage": "The exact original text passed in above, unchanged."
}

Generate 5 MCQs, 3 short answer, 2 long answer, 3 one-word, 4 fill-in-the-blanks, 5 flashcards.
`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    console.error("Generation error:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
