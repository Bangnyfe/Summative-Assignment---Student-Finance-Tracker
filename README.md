# Summative-Assignment---Student-Finance-Tracker

Project snapshot
- Chosen theme: Dark-first responsive UI with a light mode option (can be changed in Settings).
- Purpose: record personal expenses, manage categories, visualize spending (bar + pie charts), and persist data in localStorage.

Features
- Records: add expense records (date, description, category, amount).
- Categories: add / remove categories, category dropdown used when adding records.
- Persistence: settings, categories and records saved in localStorage.
- Charts: Spending overview (bar) and category breakdown (doughnut) rendered with Chart.js.
- Dashboard: list of all recorded expenses; charts clickable to filter records by category.
- Settings: theme toggle and "Delete all saved data" (clears app data, optional reseed).
- Accessibility & keyboard guidance included in notes below.

Regex catalog 
- ISO Date (YYYY-MM-DD)
  - Pattern: `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$`
  - Example: `2025-10-16`
- Month input (YYYY-MM)
  - Pattern: `^\d{4}-(0[1-9]|1[0-2])$`
  - Example: `2025-10`
- Currency amount (integer or decimal, up to 2 decimals)
  - Pattern: `^\d+(?:[.,]\d{1,2})?$`
  - Examples: `123`, `1234.5`, `1,234.56` 
- Strict numeric 
  - Pattern: `^\d+(\.\d{1,2})?$`
  - Example: `1234.56`
- Positive amount (> 0)
  - Pattern: `^(?!0+(\.0+)?$)\d+(?:\.\d{1,2})?$`
  - Example: `0.01`, `10`
- Category name (letters, numbers, spaces, hyphen, underscore; length limit)
  - Pattern: `^[A-Za-z0-9 _-]{1,40}$`
  - Example: `Campus Fees`, `Textbooks`
- Short description (no newlines)
  - Pattern: `^(?!.*<[^>]+>).{0,200}$`
  - Example: `Bought calculus textbook`
- Currency symbol detection (basic)
  - Pattern: `^[^\d\s]+`
  - Example matches: `$`, `€`, `rwf` 

- Keyboard Shortcuts
  - Alt + 1 — About
  - Alt + 2 — Dashboard / Stats
  - Alt + 3 — Records
  - Alt + 4 — Add/Edit Categories
  - Alt + 5 — Settings
  
Accessibility (a11y) notes
- Semantic HTML: forms use labels and inputs — keep label `for` attributes and input `id`s synchronized.
- Keyboard: ensure all interactive controls (buttons, links, selects) are reachable by Tab and have visible focus styles.
- ARIA: add ARIA live regions when charts/filters change large parts of the UI (e.g., "Filtered by category: Food").
- Color & contrast: keep contrast ratio >= 4.5:1 for body text; charts should use distinct, colorblind-friendly palett.
- Form validation: provide inline validation messages (not alert()) and ensure errors are announced to screen readers (aria-invalid, aria-describedby).
- Charts: add descriptive aria-labels and a textual summary for each chart (e.g., visually-hidden <p> summarizing totals).
- Testing: run Lighthouse (accessibility category) and axe-core during development.

- Manual tests
  - Add a category; add a record (date, description, category, amount); verify record appears in Records and Dashboard.
  - Hover chart segments — tooltips display currency-formatted amounts.
  - Click a chart segment — Records should filter to that category; clear filter works.
  - Settings -> Delete All Saved Data — confirm data cleared; optionally reseed works.
