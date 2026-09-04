# ATS Toolkit v13

- Bounded Gemini request timeout (default 15 seconds).
- Low thinking level and capped output for faster resume edits.
- Visual-only commands can be handled locally without waiting for Gemini.
- Gemini timeout falls back to safe local/rules suggestions instead of a 500 error.
- Leading `>` characters are stripped from imported/saved resume content.
- Project parser keeps a project title plus following technology-stack line together.
- Project headers remain bold and controlled by `projectTitleWeight` and `projectTitleSize`.
- Added Gemini timeout/model environment variables.
