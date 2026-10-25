// Run with: node scripts/validate-questions.mjs
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("data/manifest.json", "utf8"));
let errors = 0;
const fail = (msg) => { console.error("ERROR:", msg); errors++; };

for (const topic of manifest.topics) {
  const { questions } = JSON.parse(readFileSync(`data/${topic.file}`, "utf8"));
  const ids = new Set();
  questions.forEach((q, n) => {
    const where = `${topic.file} #${n + 1} (${q.id})`;
    if (!q.id || ids.has(q.id)) fail(`${where}: missing or duplicate id`);
    ids.add(q.id);
    if (!q.question?.trim()) fail(`${where}: empty question`);
    if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${where}: needs exactly 4 options`);
    else if (new Set(q.options).size !== 4) fail(`${where}: options must be different`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) fail(`${where}: answer must be 0 to 3`);
  });
  console.log(`${topic.title}: ${questions.length} questions checked`);
}
process.exit(errors ? 1 : 0);
