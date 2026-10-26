// Run with: node --test tests/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { ExamSession } from "../js/exam.js";
import { shuffle, formatTime } from "../js/utils.js";

const qs = [
  { id: "a", question: "Q1", options: ["right", "w1", "w2", "w3"], answer: 0 },
  { id: "b", question: "Q2", options: ["w1", "right", "w2", "w3"], answer: 1 },
];
const topic = { id: "t", title: "Topic" };

test("shuffle keeps every item", () => {
  assert.deepEqual(shuffle([1, 2, 3, 4]).sort(), [1, 2, 3, 4]);
});

test("formatTime pads and never goes negative", () => {
  assert.equal(formatTime(3600), "60:00");
  assert.equal(formatTime(65), "01:05");
  assert.equal(formatTime(-3), "00:00");
});

test("scoring follows the correct option even after shuffling", () => {
  const s = new ExamSession(topic, qs, { durationSec: 60 });
  s.items.forEach((item, i) => {
    s.goTo(i);
    s.select(item.options.findIndex((o) => o.correct));
  });
  assert.equal(s.score(), 2);
  assert.equal(s.answered, 2);
});

test("unanswered and wrong answers score zero", () => {
  const s = new ExamSession(topic, qs, { durationSec: 60 });
  s.select(s.items[0].options.findIndex((o) => !o.correct));
  assert.equal(s.score(), 0);
  assert.equal(s.result("Ada", 10).percent, 0);
});

test("navigation stays within bounds and flags toggle", () => {
  const s = new ExamSession(topic, qs, { durationSec: 60 });
  s.goTo(99);
  assert.equal(s.current, 1);
  s.goTo(-5);
  assert.equal(s.current, 0);
  s.toggleFlag();
  assert.equal(s.items[0].flagged, true);
});
