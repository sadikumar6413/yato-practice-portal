# CBT Practice Portal

A browser-based computer-based test (CBT) practice portal for health students. It simulates the real exam experience (countdown timer, one question per screen, question navigator, flagging, auto-submit and a full answer review) so first-time candidates can get comfortable before the actual exam.

Built for students of Yato College of Health Sciences and Technology. The portal is **for practice only** and is clearly marked as such.

## Features

- Timed exam (default 70 questions in 60 minutes) that submits itself when time runs out
- Question navigator showing answered and flagged questions, with Previous and Next
- Questions and answer options reshuffled on every attempt
- Confirmation before submitting, with a count of unanswered questions
- Results page with score, time used and a review of every question with the correct answer
- Attempt history saved in the browser (localStorage)
- Responsive layout with light and dark mode
- Question bank kept in JSON, with a validation script to catch mistakes

## Tech

Vanilla HTML, CSS and JavaScript (ES modules). No frameworks and no build step, so it can be hosted on any static host. Tests use Node's built-in test runner.

## Project structure

```
cbt-portal/
  index.html                  Page shell (header, notice, app container)
  css/styles.css              All styling, with light and dark themes
  js/
    main.js                   Entry point: loads data and connects screens to exam logic
    exam.js                   ExamSession class: shuffling, answers, flags, scoring (no DOM code)
    timer.js                  Clock-based Countdown
    ui.js                     Rendering for home, exam, confirm dialog and results
    storage.js                Attempt history in localStorage
    utils.js                  shuffle, formatTime and a small DOM helper
    config.js                 Constants (low-time warning, history limit)
  data/
    manifest.json             School name, level and the list of topics
    <topic>.json              One question bank per topic
  scripts/validate-questions.mjs   Checks every question file
  tests/exam.test.mjs         Unit tests for the exam logic
```

## Run locally

The portal loads its data with `fetch`, so it must be served over HTTP (opening `index.html` by double-click will not work).

```bash
python3 -m http.server 8000      # or: npm start
```

Then open http://localhost:8000.

## Add questions or a new topic

1. Create `data/<topic-name>.json`:

```json
{
  "topic": "Topic title",
  "questions": [
    {
      "id": "topic-001",
      "question": "What is ...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "explanation": "Optional text shown in the review."
    }
  ]
}
```

`answer` is the index (0 to 3) of the correct option. Options are shuffled when the exam starts.

2. Register it in `data/manifest.json`:

```json
{ "id": "topic-name", "title": "Topic title", "file": "topic-name.json", "durationMinutes": 60 }
```

3. Check your work:

```bash
npm run validate
npm test
```

## Deploy

Upload the folder to any static host: GitHub Pages, Netlify (drag and drop the folder), or Cloudflare Pages. No build settings are needed.

## Roadmap

- Mixed exam drawing from all topics
- Practice mode with instant feedback
- Explanations for every question
- Installable offline version (PWA)
- Admin page for adding questions

## Author

Add your name and links here.
