# ATS Toolkit v12

## Gemini AI migration
- Replaced the OpenAI AI optimizer route with Gemini API.
- Default model: `gemini-3.7-flash`.
- Uses structured JSON output for reviewable resume edits.
- Server-side API key only: `GEMINI_API_KEY`.
- Optional model override: `GEMINI_MODEL`.

## AI resume editing
The Smart Resume Editor supports natural-language instructions such as:
- Make project titles bold.
- Make project titles slightly larger.
- Move Skills above Projects.
- Reduce section spacing.
- Make the resume more ATS-friendly.
- Improve bullets for the target JD without inventing facts.

AI changes are returned as controlled content/layout actions and remain reviewable before application.

## Resume structure fixes
- Removed the accidental `>` character before names in the generic template renderer.
- Project sections are parsed into project headers and bullet lists.
- Project headers render bold across the templates.
- Technology stacks on project header lines remain part of the header instead of becoming bullets.
- The uploaded reference template remains available as `Signature ATS Reference`.

## Environment
Copy `.env.local.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.7-flash
```

Do not expose `GEMINI_API_KEY` through a `NEXT_PUBLIC_` variable.

## Supabase
No new database migration is required for v12.
