import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import pdf from "pdf-parse";

const SOURCE_URL =
  "https://www.servicenow.com/community/s/cgfwn76974/attachments/cgfwn76974/training-certifications-forum/10716/1/CSA%20Exam%20Points%20Desitribution.pdf";

const QUESTION_DOMAINS = [
  "User Interface and Navigation",
  "Collaboration",
  "Database Administration",
  "Self-Service and Process Automation",
  "Introduction to Development",
];

function sanitizeOptionText(text) {
  return text
    .replace(/ServiceNow,.*$/i, "")
    .replace(/Other company names.*$/i, "")
    .replace(/\s*and\/or other countries\.$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLines(text) {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/©\s*\d{4}\s*ServiceNow, Inc\. All rights reserved\./gi, "")
        .replace(/ServiceNow, the ServiceNow logo[\s\S]*$/i, "")
        .replace(
          /ServiceNow, the ServiceNow logo, Now, and other ServiceNow marks are trademarks and\/or registered trademarks of ServiceNow, Inc\., in the United States and\/or other countries\./gi,
          ""
        )
        .replace(
          /Other company names, product names, and logos may be trademarks of the respective companies with which they are associated\./gi,
          ""
        )
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .filter(
      (line) =>
        !/^©\s*\d{4}\s*ServiceNow/i.test(line) &&
        !/^page\s+\d+/i.test(line) &&
        !/^servicenow confidential/i.test(line)
    );
}

function extractQuestionSegments(text) {
  const matches = [...text.matchAll(/Sample Item #(\d+):?/gi)];

  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : text.length;

    return {
      number: Number(match[1]),
      body: text.slice(start, end),
    };
  });
}

function parseSegment(segment, index) {
  const lines = cleanLines(segment.body);
  const options = [];
  const questionLines = [];
  let correctAnswer = "";
  let currentOption = null;

  for (const line of lines) {
    const answerMatch = line.match(/^(?:Correct Answer|Answer):\s*([A-D])/i);

    if (answerMatch) {
      correctAnswer = answerMatch[1].toUpperCase();
      continue;
    }

    const optionMatch = line.match(/^([A-D])\.\s*(.+)$/);

    if (optionMatch) {
      currentOption = {
        id: optionMatch[1],
        text: sanitizeOptionText(optionMatch[2]),
      };
      options.push(currentOption);
      continue;
    }

    if (currentOption) {
      currentOption.text = sanitizeOptionText(`${currentOption.text} ${line}`);
      continue;
    }

    questionLines.push(line);
  }

  return {
    id: `official-sample-${segment.number}`,
    number: segment.number,
    domain: QUESTION_DOMAINS[index] ?? "ServiceNow CSA",
    question: questionLines.join(" ").replace(/\s+/g, " ").trim(),
    options,
    correctAnswer,
  };
}

async function main() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; CSARevisionTracker/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch source PDF: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const parsed = await pdf(buffer);
  const segments = extractQuestionSegments(parsed.text);
  const questions = segments
    .map(parseSegment)
    .filter(
      (question) =>
        question.question &&
        question.options.length >= 2 &&
        /^[A-D]$/.test(question.correctAnswer)
    );

  if (!questions.length) {
    throw new Error("No practice questions could be parsed from the source PDF.");
  }

  const payload = {
    source: {
      label: "ServiceNow CSA blueprint sample questions",
      sourceUrl: SOURCE_URL,
      fetchedAt: new Date().toISOString(),
      notes:
        "Questions are scraped from the public ServiceNow community blueprint PDF attachment. They are sample items, not a full official mock exam.",
    },
    questions,
  };

  const outputPath = resolve("src/data/csaQuestions.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Wrote ${questions.length} questions to ${outputPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
