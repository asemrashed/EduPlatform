import puppeteer from "puppeteer";

export type WorksheetPdfQuestion = {
  question: string;
  type: string;
  marks: number;
  options?: { text: string; isCorrect?: boolean }[];
  correctAnswer?: string;
};

export type WorksheetPdfInput = {
  title: string;
  subtitle?: string;
  questions: WorksheetPdfQuestion[];
  includeAnswers?: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function optionLabel(index: number) {
  return String.fromCharCode(65 + index);
}

function renderQuestionBody(q: WorksheetPdfQuestion, index: number) {
  const header = `<div class="q-head"><span class="q-num">${index + 1}.</span> <span class="q-text">${escapeHtml(q.question)}</span> <span class="q-marks">[${q.marks} mark${q.marks === 1 ? "" : "s"}]</span></div>`;

  if (q.type === "mcq" && q.options?.length) {
    const opts = q.options
      .map(
        (opt, i) =>
          `<li><span class="opt-label">${optionLabel(i)}.</span> ${escapeHtml(opt.text)}</li>`,
      )
      .join("");
    return `${header}<ol class="options">${opts}</ol>`;
  }

  if (q.type === "true_false") {
    return `${header}<p class="tf">Circle: True / False</p>`;
  }

  if (q.type === "fill_blank") {
    return `${header}<p class="blank-line">Answer: _______________________________</p>`;
  }

  return `${header}<div class="written-space"></div>`;
}

function renderAnswer(q: WorksheetPdfQuestion, index: number) {
  if (q.type === "mcq" && q.options?.length) {
    const correct = q.options
      .map((opt, i) => (opt.isCorrect ? optionLabel(i) : null))
      .filter(Boolean);
    if (correct.length) {
      return `<p><strong>${index + 1}.</strong> ${correct.join(", ")}</p>`;
    }
  }
  if (q.correctAnswer?.trim()) {
    return `<p><strong>${index + 1}.</strong> ${escapeHtml(q.correctAnswer.trim())}</p>`;
  }
  return `<p><strong>${index + 1}.</strong> —</p>`;
}

export async function buildWorksheetPdfBuffer(input: WorksheetPdfInput) {
  const questionsHtml = input.questions
    .map((q, i) => `<div class="question">${renderQuestionBody(q, i)}</div>`)
    .join("");

  const answersHtml =
    input.includeAnswers && input.questions.length
      ? `<div class="answers page-break"><h2>Answer key</h2>${input.questions
          .map((q, i) => renderAnswer(q, i))
          .join("")}</div>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(input.title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 40px 48px;
    font-family: "Segoe UI", system-ui, sans-serif;
    font-size: 14px;
    color: #111;
    line-height: 1.5;
  }
  h1 { font-size: 22px; margin: 0 0 6px; }
  .subtitle { color: #555; font-size: 13px; margin-bottom: 28px; }
  .question { margin-bottom: 22px; page-break-inside: avoid; }
  .q-head { font-weight: 600; margin-bottom: 8px; }
  .q-num { margin-right: 4px; }
  .q-marks { font-weight: 400; color: #666; font-size: 12px; margin-left: 6px; }
  .options { list-style: none; padding: 0; margin: 8px 0 0 18px; }
  .options li { margin: 4px 0; }
  .opt-label { font-weight: 600; margin-right: 6px; }
  .written-space { height: 72px; border-bottom: 1px dashed #ccc; margin-top: 10px; }
  .blank-line { margin-top: 8px; }
  .tf { margin-top: 8px; color: #444; }
  .page-break { page-break-before: always; }
  .answers h2 { font-size: 18px; margin-bottom: 12px; }
  .answers p { margin: 6px 0; font-size: 13px; }
</style>
</head>
<body>
  <h1>${escapeHtml(input.title)}</h1>
  ${input.subtitle ? `<p class="subtitle">${escapeHtml(input.subtitle)}</p>` : ""}
  ${questionsHtml}
  ${answersHtml}
</body>
</html>`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
