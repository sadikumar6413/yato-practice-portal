import { LOW_TIME_SEC } from "./config.js";
import { ExamSession } from "./exam.js";
import { Countdown } from "./timer.js";
import { clearHistory, loadHistory, saveResult } from "./storage.js";
import { formatTime } from "./utils.js";
import * as ui from "./ui.js";

const root = document.getElementById("app");
const clock = document.getElementById("clock");
let topics = [];
let countdown = null;

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

async function init() {
  try {
    const manifest = await loadJson("data/manifest.json");
    document.getElementById("school").textContent = manifest.school;
    document.getElementById("level").textContent = manifest.level;
    document.title = `${manifest.school} CBT Practice`;
    topics = await Promise.all(
      manifest.topics.map(async (t) => ({ ...t, questions: (await loadJson(`data/${t.file}`)).questions })),
    );
    home();
  } catch (err) {
    root.textContent = `The portal could not load its data. Run it from a web server, not by double-clicking the file (see README). ${err.message}`;
  }
}

function home() {
  clock.textContent = "";
  ui.renderHome(root, {
    topics,
    history: loadHistory(),
    onStart: start,
    onClear: () => { clearHistory(); home(); },
  });
}

function start(topic, name) {
  const session = new ExamSession(topic, topic.questions, { durationSec: topic.durationMinutes * 60 });
  const draw = () => ui.renderExam(root, session, {
    onSelect: (i) => { session.select(i); draw(); },
    onNav: (n) => { session.goTo(n); draw(); },
    onFlag: () => { session.toggleFlag(); draw(); },
    onSubmit: async () => {
      if (await ui.confirmSubmit(session.total - session.answered)) finish(session, name);
    },
  });
  countdown = new Countdown(session.durationSec, showClock, () => finish(session, name));
  draw();
  countdown.start();
}

function showClock(left) {
  clock.textContent = formatTime(left);
  clock.classList.toggle("lo", left < LOW_TIME_SEC);
}

function finish(session, name) {
  if (session.finished) return;
  session.finished = true;
  countdown.stop();
  document.querySelectorAll("dialog").forEach((d) => d.close("no"));
  const result = session.result(name, session.durationSec - countdown.left);
  saveResult(result);
  clock.textContent = "";
  ui.renderResult(root, session, result, { onHome: home });
  window.scrollTo(0, 0);
}

init();
