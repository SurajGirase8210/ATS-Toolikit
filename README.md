# AI Career Copilot

AI Career Copilot evolves the existing ATS Toolkit into an evidence-first job application workspace. It keeps the current Next.js + Supabase architecture and adds career intelligence without pretending deterministic scores are hiring predictions.

## Current working modules
- Resume upload and parsing for PDF/DOCX/TXT
- Deterministic ATS and semantic analysis
- Evidence-first Smart Resume Editor with controlled visual edits
- Project-title detection and bold project headers
- Exact reference resume template
- Cover letter and interview preparation with PDF print export
- Application tracker and dashboard
- Career Gap Analyzer
- Recruiter View
- Career Copilot hub
- Supabase career profiles and resume-version schema

## AI architecture
Gemini remains optional and server-side. The Smart Resume Editor uses local deterministic handling for common visual commands so requests such as “make project headings bold” do not need a network round trip. When Gemini is configured, generated content changes remain reviewable and evidence-constrained.

## Run locally
```bash
npm install
cp .env.local.example .env.local
# add Supabase values and optionally GEMINI_API_KEY
npm run dev
```

Run the SQL files in `supabase/migrations/` in order for a fresh Supabase project.

## Environment
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` optional
- `GEMINI_MODEL` optional
- `GEMINI_TIMEOUT_MS` optional
- `GEMINI_MAX_OUTPUT_TOKENS` optional

## Trust and scoring
ATS and career scores are rule-based directional measurements. They do not guarantee ATS passage, interviews or employment. Missing requirements are not inserted into resumes unless the user provides supporting evidence.

## Deployment
The current app is compatible with the existing Vercel + Supabase deployment. No Docker dependency is introduced by this upgrade.

## Next engineering phases
Extract heavy document/OCR processing to FastAPI only when the Next.js runtime becomes a measurable bottleneck. Add background jobs, pgvector embeddings, richer TruthGuard claim-level provenance, AI mock interviews and billing only after the core workflow is stable.

## Supabase email delivery
- The app uses email + password authentication. Normal sign-in does not send an email.
- For local development, you can disable **Confirm email** in Supabase Authentication → Providers → Email if you do not need email verification yet.
- For production, configure a custom SMTP provider before allowing public signup or password recovery.
- See `PRODUCTION-AUTH-SETUP.md` for the exact checklist and the reason the built-in Supabase sender can trigger rate-limit/bounce warnings.

## Authentication and Gemini notes
- Login and account creation use Supabase email + password authentication.
- Normal login does not send an email verification code, avoiding OTP rate limits during sign-in.
- Password recovery uses Supabase's password-reset email flow.
- If email confirmation is enabled in Supabase, new accounts may still receive one confirmation email before first login.
- `GEMINI_FALLBACK_MODELS` can contain comma-separated fallback models for temporary 429/5xx Gemini demand errors.


## V24 UI polish
- Refined global visual polish and focus states.
- Upgraded Career Copilot chat with contextual prompts, timestamps, copy actions, responsive expand mode, quick next-step action, improved typing state, and richer empty-state UI.
