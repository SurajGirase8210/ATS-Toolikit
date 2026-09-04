# ATS Toolkit v11

## AI Resume Editor
- Migrated OpenAI integration from Chat Completions to the Responses API.
- Default model is `gpt-5.6-luna`.
- Uses strict structured JSON output.
- Returns useful OpenAI error messages instead of a generic 500.
- Supports both JD-driven optimization and natural-language visual editing instructions.
- Supports controlled layout changes such as project-title weight/size, section heading size, margins, body size, line height, section order, and template switching.
- Changes remain reviewable and require user approval before applying.

## Security
- Keep `OPENAI_API_KEY` server-side in `.env.local`.
- Do not commit `.env.local` or expose the key through `NEXT_PUBLIC_*`.

## Existing database
No Supabase migration is required.
