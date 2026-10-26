import { h } from "./utils.js";

const LETTERS = "ABCD";

export function renderHome(root, { topics, history, onStart, onClear }) {
  const nameInput = h("input", { id: "nm", placeholder: "Enter your name", autocomplete: "name" });
  root.replaceChildren(...[
    h("section", { class: "c" },
      h("h2", {}, "CBT practice exam"),
      h("p", {}, "Choose a topic, answer each question, flag the ones you want to revisit and submit before the timer runs out. The exam submits itself when time is up."),
      h("label", { for: "nm" }, "Your name"),
      nameInput),
    topics.map((t) =>
      h("section", { class: "c" },
        h("h3", {}, t.title),
        h("p", { class: "mu" }, `${t.questions.length} questions, ${t.durationMinutes} minutes`),
        h("button", { class: "p", onclick: () => onStart(t, nameInput.value.trim()) }, "Start exam"))),
    history.length ? historyCard(history, onClear) : null,
  ].flat().filter(Boolean));
}

function historyCard(history, onClear) {
  return h("section", { class: "c" },
    h("h3", {}, "Your previous attempts"),
    h("table", {},
      h("tr", {}, h("th", {}, "Date"), h("th", {}, "Topic"), h("th", {}, "Score")),
      history.slice(0, 10).map((r) =>
        h("tr", {},
          h("td", {}, new Date(r.date).toLocaleDateString()),
          h("td", {}, r.topicTitle),
          h("td", {}, `${r.score}/${r.total} (${r.percent}%)`)))),
    h("p", {}, h("button", { onclick: onClear }, "Clear history")));
}

export function renderExam(root, s, { onSelect, onNav, onFlag, onSubmit }) {
  const q = s.items[s.current];
  root.replaceChildren(
    h("div", { class: "w" },
      h("section", { class: "c" },
        h("div", { class: "mu" }, `Question ${s.current + 1} of ${s.total}`),
        h("h3", {}, q.question),
        q.options.map((o, i) =>
          h("button", { class: "o" + (q.selected === i ? " s" : ""), "aria-pressed": String(q.selected === i), onclick: () => onSelect(i) },
            h("b", {}, `${LETTERS[i]}. `), o.text)),
        h("div", { class: "r" },
          h("span", {},
            h("button", { onclick: () => onNav(s.current - 1), disabled: s.current === 0 }, "Previous"), " ",
            h("button", { onclick: () => onNav(s.current + 1), disabled: s.current === s.total - 1 }, "Next")),
          h("span", {},
            h("button", { onclick: onFlag }, q.flagged ? "Unflag" : "Flag"), " ",
            h("button", { class: "p", onclick: onSubmit }, "Submit")))),
      h("section", { class: "c" },
        h("b", {}, "Questions"),
        h("p", { class: "mu" }, `${s.answered} of ${s.total} answered`),
        h("div", { class: "g" },
          s.items.map((it, i) =>
            h("button", { class: [it.selected >= 0 && "a", it.flagged && "f", i === s.current && "n"].filter(Boolean).join(" "), onclick: () => onNav(i) }, String(i + 1)))),
        h("p", { class: "mu" }, "Green: answered. Orange ring: flagged."))));
}

export function confirmSubmit(unanswered) {
  return new Promise((resolve) => {
    const note = unanswered ? `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}. ` : "";
    const dialog = h("dialog", { class: "c" },
      h("p", {}, `${note}Submit your exam now?`),
      h("div", { class: "r" },
        h("button", { onclick: () => dialog.close("no") }, "Back to exam"),
        h("button", { class: "p", onclick: () => dialog.close("yes") }, "Submit now")));
    dialog.addEventListener("close", () => {
      resolve(dialog.returnValue === "yes");
      dialog.remove();
    });
    document.body.append(dialog);
    dialog.showModal();
  });
}

export function renderResult(root, s, r, { onHome }) {
  root.replaceChildren(
    h("section", { class: "c" },
      h("h2", {}, `${r.name || "Your"} result`),
      h("h1", {}, `${r.score} / ${r.total} (${r.percent}%)`),
      h("p", { class: "mu" }, `Time used: ${Math.floor(r.timeUsedSec / 60)} min ${r.timeUsedSec % 60} sec`),
      h("button", { class: "p", onclick: onHome }, "Back to topics")),
    h("section", { class: "c" },
      h("h3", {}, "Review"),
      s.items.map((it, i) => {
        const right = it.options.find((o) => o.correct);
        const mine = it.selected >= 0 ? it.options[it.selected] : null;
        return h("div", { class: "rv" },
          h("b", {}, `${i + 1}. ${it.question}`),
          h("div", { class: "ok" }, `Correct: ${right.text}`),
          mine && mine.correct ? null : h("div", { class: "bad" }, `Your answer: ${mine ? mine.text : "Not answered"}`),
          it.explanation ? h("div", { class: "mu" }, it.explanation) : null);
      })));
}
