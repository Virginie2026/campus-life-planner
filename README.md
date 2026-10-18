# Campus Life Planner

A responsive, accessible task planner for campus life, built with **vanilla HTML, CSS and JavaScript** (no frameworks). Students can plan classes, projects, exams and events, search them with regular expressions, and see simple statistics on a dashboard.

| | |
|---|---|
| **Live site (GitHub Pages)** | https://virginie2026.github.io/campus-life-planner/ |
| **Demo video (unlisted)** | TODO: paste your video link here |
| **Repository** | https://github.com/Virginie2026/campus-life-planner |
| **Chosen theme** | Campus Life Planner |
| **Author** | Sia Virginie Millimouno, African Leadership University |

---

## Table of contents

1. [Purpose](#purpose)
2. [Features](#features)
3. [Project structure](#project-structure)
4. [How the code is organised](#how-the-code-is-organised)
5. [Data model](#data-model)
6. [Regex catalog](#regex-catalog)
7. [Search, highlight and sorting](#search-highlight-and-sorting)
8. [Dashboard and weekly cap](#dashboard-and-weekly-cap)
9. [Settings, units and import/export](#settings-units-and-importexport)
10. [Seed data](#seed-data)
11. [Keyboard map](#keyboard-map)
12. [Accessibility notes](#accessibility-notes)
13. [Responsive design and visual style](#responsive-design-and-visual-style)
14. [Run locally](#run-locally)
15. [Run the tests](#run-the-tests)
16. [Deploy on GitHub Pages](#deploy-on-github-pages)
17. [Development process (milestones)](#development-process-milestones)
18. [Problems I met and how I fixed them](#problems-i-met-and-how-i-fixed-them)
19. [Known limitations](#known-limitations)
20. [Credits](#credits)
21. [Contact](#contact)

---

## Purpose

Campus Life Planner helps students organise their week: classes, study sessions, projects, exams, sports and campus events. Each task has a title, a duration in minutes, a tag, a start time and a due date. The app saves everything in the browser, so nothing is lost when the page is reloaded.

The project demonstrates: semantic HTML, mobile-first CSS, DOM manipulation, event handling, regex validation and search, localStorage persistence, JSON import/export with validation, and accessibility.

---

## Features

**Tasks**
- Add a task with a validated form
- Edit a task (the **Edit** button fills the form, then **Save task** updates it and refreshes `updatedAt`)
- Delete a task (with a confirmation message)
- Every task gets a unique `id` (`rec_0001`, `rec_0002`, ...) and `createdAt` / `updatedAt` timestamps

**Validation (regex)**
- 5 field rules plus 1 advanced rule (duplicate word with a back-reference)
- Errors appear **under each field while typing**, and again when the form is submitted
- Invalid fields get `aria-invalid="true"` and a red border

**Search and sort**
- Live regex search on title, tag and due date
- Case-insensitive toggle
- Matches are highlighted with `<mark>`
- A broken pattern never crashes the app (safe regex compiler)
- Sort by date, title (A to Z or Z to A) and duration (up or down)

**Dashboard**
- Total number of tasks
- Total time
- Most used tag
- Bar chart of the last 7 days (pure CSS and JavaScript, no library)
- Weekly cap with a live message

**Settings and data**
- Show durations in minutes or hours
- Automatic save to `localStorage`
- JSON export (download) and JSON import with structure validation

**Design**
- Mobile-first, 3 breakpoints (360px base, 768px, 1024px)
- Smooth animations that are disabled for users who prefer reduced motion

---

## Project structure

```
campus-life-planner/
├── index.html          Main page (all sections)
├── tests.html          Small tests for the validators
├── seed.json           10 sample tasks, including edge cases
├── README.md           This file
├── styles/
│   └── main.css        All styles (mobile-first)
└── scripts/
    ├── app.js          Connects everything (events, form, state)
    ├── validators.js   Regex rules and error messages
    ├── storage.js      localStorage and import validation
    ├── search.js       Safe regex, highlight, filter and sort
    └── ui.js           Draws the table and the dashboard
```

The folder is called `scripts` in **lowercase**. On GitHub Pages, `Scripts` and `scripts` are different paths.

---

## How the code is organised

The JavaScript uses **ES modules**. `index.html` loads only one script:

```html
<script type="module" src="scripts/app.js"></script>
```

`app.js` then imports the other modules. Each file has one job:

| File | Job | Main functions |
|---|---|---|
| `validators.js` | Checks form values | `validateField(name, value)`, `isRealDate(text)` |
| `storage.js` | Saves and loads data | `loadRecords`, `saveRecords`, `loadSettings`, `saveSettings`, `isValidImport` |
| `search.js` | Regex search and sorting | `compileRegex`, `highlight`, `filterRecords`, `sortRecords` |
| `ui.js` | Draws the page | `renderTable`, `renderStats`, `formatDuration` |
| `app.js` | Chef d'orchestre | `refresh()`, `generateId()`, form and button events |

**How data flows**

1. On load, `app.js` reads `records` and `settings` from localStorage.
2. `refresh()` reads the search box and the sort menu, filters and sorts the records, then calls `renderTable` and `renderStats`.
3. Every change (add, edit, delete, import, search, unit, cap) updates the `records` array, saves it, and calls `refresh()` again.

Because ES modules are blocked when a file is opened by double-click, the app must be served by a web server (Live Server locally, GitHub Pages online).

---

## Data model

```json
{
  "id": "rec_0001",
  "title": "Study for Math exam",
  "duration": 90,
  "tag": "Exam",
  "startTime": "09:00",
  "dueDate": "2026-10-15",
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Unique id, generated as `rec_` + 4-digit number |
| `title` | string | Name of the task |
| `duration` | number | Minutes (up to 2 decimals) |
| `tag` | string | Category (letters, spaces, hyphens) |
| `startTime` | string | `HH:MM` |
| `dueDate` | string | `YYYY-MM-DD` |
| `createdAt` | string | ISO date, set once when the task is created |
| `updatedAt` | string | ISO date, refreshed when the task is edited |

Data is stored in localStorage under two keys: `campus_records` (the tasks) and `campus_settings` (unit and cap).

---

## Regex catalog

| Field | Pattern | Valid example | Invalid example |
|---|---|---|---|
| Title | `^(?!.*\s{2})\S(?:.*\S)?$` | `Study for exam` | ` Study` (leading space), `Study  now` (double space) |
| Duration | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | `45.5` | `1.234`, `007`, `abc` |
| Tag | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | `Group-work` | `Exam2`, `-Exam` |
| Start time | `^([01]\d\|2[0-3]):([0-5]\d)$` | `14:30` | `25:00`, `9:00` |
| Due date | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | `2026-10-30` | `2026-13-01` |
| Duplicate word (advanced) | `\b(\w+)\s+\1\b` | (not matched) `Study for exam` | (rejected) `Study study now` |

**How each rule works**

- **Title.** `(?!.*\s{2})` is a **negative lookahead**: it fails if two spaces in a row appear anywhere. `\S(?:.*\S)?` forces the first and last characters to be non-space. Together they forbid leading, trailing and double spaces. Allowing a one-character title is deliberate: `\S` followed by an optional group.
- **Duration.** Either `0` or a number that does not start with 0, with an optional dot and 1 to 2 decimals. The code also rejects `0` itself with `parseFloat(value) <= 0`.
- **Tag.** Words made of letters, separated by one space or one hyphen.
- **Start time.** Hours `00` to `23`, minutes `00` to `59`.
- **Due date.** The regex checks the format. The function `isRealDate` then builds a `Date` and compares it with the text, so `2026-02-31` is rejected even though it matches the pattern. `2028-02-29` is accepted because 2028 is a leap year.
- **Duplicate word.** `\b(\w+)\s+\1\b` uses a **back-reference** (`\1` repeats whatever the first group matched). It catches `the the`. It is case-insensitive (`i` flag).

### Regex search examples

| Pattern | What it finds |
|---|---|
| `^Exam` | Tasks whose title, tag or date starts with "Exam" |
| `(lunch\|dinner)` | Either word |
| `\d{2}:\d{2}` | A time-like token such as `17:30` in a title |
| `\b(\w+)\s+\1\b` | A repeated word in a title |
| `(abc` | Invalid pattern: shows "Invalid regex pattern." |

---

## Search, highlight and sorting

**Safe regex compiler** (`compileRegex`)

```js
new RegExp(input, ignoreCase ? 'i' : '')   // inside try/catch
```

If the pattern is empty, it returns `null` (no search). If the pattern is broken (for example `(abc`), the `catch` returns `null` and the page shows "Invalid regex pattern." instead of crashing.

**Highlight** (`highlight`)

1. Every piece of text is first passed through `escapeHtml`, which turns `&`, `<` and `>` into safe characters. This stops a title such as `<important>` from being treated as HTML.
2. Each match is wrapped in `<mark>...</mark>`.
3. Empty matches are skipped, so patterns like `a*` cannot cause an infinite loop.

**Filter** (`filterRecords`) keeps a task if the regex matches its title, tag or due date.

**Sort** (`sortRecords`) reads values such as `date-asc` or `title-desc`. It sorts a **copy** of the array, so the saved data is never changed. Dates and titles use `localeCompare`, durations use subtraction.

---

## Dashboard and weekly cap

- **Total tasks** and **Total time** are computed from all saved tasks (not only the filtered ones).
- **Top tag** counts how many times each tag appears and keeps the highest.
- **Last 7 days chart** adds the durations of tasks whose due date falls on each of the last 7 days. Bar heights are relative to the biggest day.
- **Weekly cap** compares the cap (in minutes) with the total time:
  - Under or equal to the cap: `aria-live="polite"` and the message "X minutes remaining."
  - Over the cap: `aria-live="assertive"`, a red message "Cap exceeded by X minutes!" (CSS class `over`).

---

## Settings, units and import/export

**Units.** The Settings menu switches between **minutes** and **hours** (`minutes / 60`, 2 decimals, for example `25.25 min` becomes `0.42 h`). The choice is saved.

**Export.** The **Export JSON** button creates a Blob from the `records` array and downloads `campus-tasks.json`.

**Import.** The **Choose File** input reads a `.json` file and runs these checks before replacing any data:

1. The text must be valid JSON (otherwise "Import failed: not valid JSON.").
2. The JSON must be an array.
3. Each item must have: `id` (string), `title` (string), `duration` (number), `tag` (string), `startTime` (string), `dueDate` (string). Otherwise "Import failed: wrong structure."

On success the page shows "Imported N tasks.", saves the data and redraws. If the data in localStorage is ever corrupted, `loadRecords` catches the error and starts with an empty list instead of crashing.

---

## Seed data

`seed.json` contains 10 tasks. Load it from **Settings > Import JSON**. They are chosen to test difficult cases:

| Id | Case tested |
|---|---|
| `rec_0001`, `rec_0002` | Normal tasks |
| `rec_0003` | Very small duration (`0.5`) and a far due date (`2026-12-31`) |
| `rec_0004` | Very large duration (`9999`) |
| `rec_0005` | Leap day due date (`2028-02-29`) and a tag with a hyphen (`Campus-Event`) |
| `rec_0006` | A time-like token inside the title (`17:30`), useful for `\d{2}:\d{2}` |
| `rec_0007` | Edge date and time (`2026-01-01`, `00:00`) |
| `rec_0008` | Special characters in the title (`&` and `<important>`), which test the HTML escaping |
| `rec_0009` | Very long title, which tests the layout on small screens |
| `rec_0010` | Tag with a space (`Campus Event`) and a two-decimal duration (`25.25`) |

Several due dates fall in the last 7 days so the chart has bars.

---

## Keyboard map

| Key | Action |
|---|---|
| `Tab` | Move to the next link, field or button |
| `Shift + Tab` | Move to the previous one |
| `Enter` | Activate a link or button, or submit the form |
| First `Tab` on the page | Shows the "Skip to main content" link; `Enter` jumps to `<main>` |
| `Space` | Check or uncheck "Ignore case" |
| `Arrow keys` | Change the value of the "Sort by" and "Show duration in" menus |
| `Esc` | Close the delete confirmation |

The whole app can be used with the keyboard only: add a task, search, sort, edit, delete, change settings, import and export.

---

## Accessibility notes

- **Semantic landmarks:** `header`, `nav` (with `aria-label`), `main`, `section` and `footer`, with a logical heading order (one `h1`-level brand link, `h2` per section, `h3` inside).
- **Skip link:** hidden above the page and revealed on focus.
- **Labels:** every input has a `<label for="...">`. The table has a visually hidden `<caption>` and `scope="col"` on headers.
- **Visible focus:** a 3px outline on links, inputs, selects and buttons (a light outline in the dark header).
- **Errors:** each field has a `<p class="error" role="alert">` linked with `aria-describedby`, and `aria-invalid` is set on invalid fields.
- **Status messages:** form, search and import messages use `role="status"`.
- **Cap message:** `aria-live` switches between `polite` and `assertive`.
- **Highlight:** `<mark>` is a real semantic element, and matches stay readable text.
- **Reduced motion:** a `prefers-reduced-motion` rule turns off animations and transitions.
- **Colour contrast:** text colours were chosen for good contrast (dark burgundy and near-black on white or cream; cream on burgundy in the header and table headings). The accent taupe from the palette is not used for text.

---

## Responsive design and visual style

**Mobile-first.** The base CSS targets about 360px (one column). Media queries add layout at larger sizes:

| Breakpoint | Layout |
|---|---|
| Base (about 360px) | One column. Tables scroll horizontally inside `.table-wrapper`. |
| `min-width: 768px` | Form in 2 columns, dashboard cards in 3 columns |
| `min-width: 1024px` | Form in 3 columns, larger card padding |

**Palette** (burgundy and cream)

| Colour | Hex | Use |
|---|---|---|
| Burgundy | `#4C0F2E` | Header, buttons, table headings, chart bars, stat numbers |
| Very dark | `#2D161E` | Footer, button hover, section titles |
| Cream | `#EBE2DB` | Page background, stat cards, alternate table rows |
| Pale rose | `#E0C3B5` | Borders, navigation links |
| Taupe | `#B09287` | Palette accent, decoration only |
| Error red | `#B3261E` | Error messages (kept red so errors are recognised) |
| Highlight yellow | `#FFD54A` | `<mark>` for search matches |

**Typography.** The title uses *Cormorant Garamond* from Google Fonts, with Georgia as a fallback. Section titles use Georgia. Body text uses Arial.

**Animation.** Cards fade up when the page loads (`fade-up`), stat cards lift slightly on hover, and buttons change colour smoothly.

---

## Run locally

1. Clone or download the repository.
2. Open the folder in VS Code and install the **Live Server** extension.
3. Right-click `index.html` and choose **Open with Live Server**.
4. In **Settings**, choose `seed.json` under **Import JSON** to load 10 sample tasks.

Do not open `index.html` by double-click: browsers block ES modules on `file://` addresses.

---

## Run the tests
Online: https://virginie2026.github.io/campus-life-planner/tests.html

Open `tests.html` with Live Server. It imports `validateField` from `scripts/validators.js` and runs 13 checks. A correct build shows **13 lines starting with `PASS`**.

| # | Test | Expected |
|---|---|---|
| 1 | Good title `Study for exam` | valid |
| 2 | Leading space ` Study` | rejected |
| 3 | Double space `Study  now` | rejected |
| 4 | Repeated word `Study study now` | rejected |
| 5 | Duration `45.5` | valid |
| 6 | Duration `0` | rejected |
| 7 | Duration `1.234` | rejected |
| 8 | Tag `Group-work` | valid |
| 9 | Tag `Exam2` | rejected |
| 10 | Time `14:30` | valid |
| 11 | Time `25:00` | rejected |
| 12 | Date `2026-10-30` | valid |
| 13 | Date `2026-02-31` (does not exist) | rejected |

Manual checks I also ran: import `seed.json`, try `^Exam` and `(abc` in the search, add and reload, edit, delete, change the unit, change the cap, and test at 360px, 768px and 1024px.

---

## Deploy on GitHub Pages

1. Push the project to a public GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, choose the branch `main` and the folder `/ (root)`, then **Save**.
4. After one or two minutes the site is live at `https://virginie2026.github.io/campus-life-planner/`.

---

## Development process (milestones)

| Milestone | Work done |
|---|---|
| **M1: Spec and wireframes** | Chose the Campus Life Planner theme, defined the data model and the sections, planned accessibility and the colour palette |
| **M2: Semantic HTML and base CSS** | Landmarks, sections, form, table; mobile-first CSS with 3 breakpoints |
| **M3: Forms and regex validation** | 5 regex rules plus a back-reference rule, inline errors, `tests.html` with 13 assertions |
| **M4: Render, sort and regex search** | Table, sorting, safe regex compiler, `<mark>` highlight |
| **M5: Stats and cap** | Dashboard, 7-day chart, cap with `aria-live` |
| **M6: Persistence, import/export, settings** | localStorage, validated JSON round-trip, minutes/hours setting |
| **M7: Polish and accessibility** | Keyboard pass, focus styles, reduced motion, README, demo video |

---

## Problems I met and how I fixed them

| Problem | Cause | Fix |
|---|---|---|
| The page showed plain unstyled HTML | A missing `;` in the CSS made the browser ignore the rules after it | Checked every rule and added the missing `;` |
| `ERR_CONNECTION_REFUSED` on `main.css` | Live Server was not running | Restarted Live Server |
| The table stayed empty | JavaScript files were mixed together in one file, and the `scripts` folder was missing | Split the code into 5 modules in `scripts/` |
| `body.InnerHTML` did nothing | JavaScript is case-sensitive: it must be `innerHTML` | Corrected the spelling |
| Import failed | `seed.json` had missing quotes, a trailing comma and a misspelt key (`uptdatedAt`) | Rewrote the JSON and checked it with the editor |
| `2026-02-29` was accepted by the regex | The regex only checks the format, not the calendar | Added `isRealDate` with `new Date` |
| A title like `<important>` could break the table | Raw text was inserted as HTML | Added `escapeHtml` before highlighting |
| Descending sort never worked | The code split the choice on `_` instead of `-` | Changed to `split('-')` |

---

## Known limitations

- Editing uses the main form (the **Edit** button fills it) rather than editing inside the table row.
- The weekly cap is compared with the total time of all saved tasks, not only the current week.
- Only minutes and hours are supported as units.
- Data stays in the browser (localStorage), so it is not shared between devices. Use Export and Import to move it.
- No images or logo are used, to keep the page light.

---

## Credits

- Font: Cormorant Garamond (Google Fonts).
- Colour palette inspired by a burgundy and cream brand board.
- I used an AI assistant (Claude) to help plan the structure and to debug syntax errors. I tested the app myself and wrote this documentation to explain how it works.
- This is a student project for African Leadership University and is not an official ALU product.

---

## Contact

- **GitHub:** https://github.com/Virginie2026
- **Email:** s.millimoun@alustudent.com