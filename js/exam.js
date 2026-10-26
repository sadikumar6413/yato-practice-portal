import { shuffle } from "./utils.js";

/** Holds all state and rules for one exam attempt. No DOM code lives here. */
export class ExamSession {
  constructor(topic, questions, { durationSec }) {
    this.topic = topic;
    this.durationSec = durationSec;
    this.current = 0;
    this.finished = false;
    this.items = shuffle(questions).map((q) => ({
      id: q.id,
      question: q.question,
      explanation: q.explanation || "",
      options: shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer }))),
      selected: -1,
      flagged: false,
    }));
  }

  get total() {
    return this.items.length;
  }

  get answered() {
    return this.items.filter((i) => i.selected >= 0).length;
  }

  select(optionIndex) {
    this.items[this.current].selected = optionIndex;
  }

  toggleFlag() {
    const item = this.items[this.current];
    item.flagged = !item.flagged;
  }

  goTo(index) {
    this.current = Math.min(this.total - 1, Math.max(0, index));
  }

  score() {
    return this.items.filter((i) => i.selected >= 0 && i.options[i.selected].correct).length;
  }

  result(name, timeUsedSec) {
    const score = this.score();
    return {
      name,
      topicId: this.topic.id,
      topicTitle: this.topic.title,
      score,
      total: this.total,
      percent: Math.round((score / this.total) * 100),
      timeUsedSec,
      date: new Date().toISOString(),
    };
  }
}
