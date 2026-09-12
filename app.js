const API_BASE = "http://localhost:3001";

const imageInput = document.getElementById("imageInput");
const extractBtn = document.getElementById("extractBtn");
const generateBtn = document.getElementById("generateBtn");
const textCard = document.getElementById("textCard");
const extractedText = document.getElementById("extractedText");
const statusDiv = document.getElementById("status");
const resultsDiv = document.getElementById("results");

function setStatus(msg) { statusDiv.textContent = msg; }

extractBtn.addEventListener("click", async () => {
  const file = imageInput.files[0];
  if (!file) { alert("Please choose or take a photo first."); return; }

  setStatus("Reading text from your photo...");
  extractBtn.disabled = true;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API_BASE}/api/extract-text`, { method: "POST", body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    extractedText.value = data.text;
    textCard.style.display = "block";
    setStatus("Text extracted. Check it looks right, then generate questions.");
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong reading the image. Try a clearer photo.");
  } finally {
    extractBtn.disabled = false;
  }
});

generateBtn.addEventListener("click", async () => {
  const text = extractedText.value.trim();
  const chapter = document.getElementById("chapter").value;
  const subtopic = document.getElementById("subtopic").value;
  if (!text) { alert("No text to work with yet."); return; }

  setStatus("Generating your explanation, quiz, and flashcards...");
  generateBtn.disabled = true;
  resultsDiv.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/api/generate-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, chapter, subtopic }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    renderResults(data);
    setStatus("Done.");
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong generating questions. Try again.");
  } finally {
    generateBtn.disabled = false;
  }
});

function renderResults(data) {
  const section = (title, html) => `<div class="result-section"><h2>${title}</h2>${html}</div>`;
  let html = "";
  html += section("Explanation", `<p>${data.simple_explanation}</p>`);
  html += section("Fun Fact", `<p>💡 ${data.fun_fact}</p>`);
  html += section("Multiple Choice Questions", data.mcqs.map((q, i) => `
    <div class="question">
      <p><strong>${i + 1}. ${q.question}</strong></p>
      <ul>${q.options.map((o) => `<li>${o}</li>`).join("")}</ul>
      <p class="answer">Answer: ${q.answer}</p>
    </div>`).join(""));
  html += section("Short Answer Questions", `<ol>${data.short_answer_questions.map((q) => `<li>${q}</li>`).join("")}</ol>`);
  html += section("Long Answer Questions", `<ol>${data.long_answer_questions.map((q) => `<li>${q}</li>`).join("")}</ol>`);
  html += section("One-Word Answers", data.one_word_answers.map((q) => `<p>${q.question} <span class="answer">→ ${q.answer}</span></p>`).join(""));
  html += section("Fill in the Blanks", data.fill_in_the_blanks.map((q) => `<p>${q.sentence_with_blank} <span class="answer">→ ${q.answer}</span></p>`).join(""));
  html += section("Flashcards", `<div class="flashcards">${data.flashcards.map((f) => `
    <div class="flashcard"><div class="front">${f.front}</div><div class="back">${f.back}</div></div>`).join("")}</div>`);
  html += section("Verbatim Passage", `<p class="verbatim">${data.verbatim_recall_passage}</p>`);
  resultsDiv.innerHTML = html;
}
