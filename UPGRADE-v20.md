# AI Career Copilot V20

## Major improvements
- Fixed `/api/ai-chat` syntax and simplified nested error handling.
- Added JD parser with role, company, skills, must-have, preferred, responsibility, experience and education signals.
- Added Unified Job Workspace at `/workspace`.
- Added one-click anonymous Demo Mode at `/demo`.
- Added JD-driven Interview Prep with separate Technical and Soft Skills sections.
- Added per-answer AI review with deterministic fallback at `/api/interview-review`.
- Interview generation now uses the supplied JD to determine the role rather than a hard-coded Data Analyst profile.
- Resume PDF/DOCX/TXT upload remains shared across tools, with file type and 10 MB validation.
- Resume Builder and analysis tools retain browser Print / PDF export.
- Dashboard now has first-use onboarding and next-action guidance.
- Navbar now exposes Job Workspace and Demo and keeps the mobile menu scrollable.
- Copilot has clear-chat, contextual quick prompts, shorter payloads and page context.
- Anonymous sample data is used throughout. The user's personal name is not used as demo data.
- Homepage routes users toward the unified workspace and demo.

## Testing
Run locally:

```powershell
npm install
npm run build
npm run dev
```

Then verify:
1. `/api/ai-chat` responds without a syntax/build error.
2. `/workspace?demo=1` loads anonymous sample data.
3. Interview Prep with a non-Data-Analyst JD produces questions for that JD role.
4. Each interview answer can be reviewed with AI Review Answer.
5. PDF upload works in ResumeInput-based tools.
6. `/demo` contains no personal user data.
