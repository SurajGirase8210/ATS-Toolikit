# ATS Toolkit v10

## Polish and deployment-readiness pass

- Added evidence-first Smart Resume Editor with reviewable before/after changes.
- Added optional server-side OpenAI or Gemini integration for generated resume rewrites.
- Added deterministic fallback when no AI provider is configured.
- Added explicit unsupported/evidence-risk labels so missing JD requirements are never silently inserted.
- Optimizer now carries the target JD into Resume Builder.
- Renamed uploaded reference template to **Signature ATS Reference**.
- Added a visible template footer: **ATS Toolkit · Signature ATS Reference**.
- Reduced global CSS transition cost by removing `transition: all`.
- Enabled Next.js compression and Lucide package import optimization.
- Added App Router loading UI for faster perceived navigation.
- No Supabase migration is required.

Before deployment, configure an AI provider key in the server environment and run `npm run build`.
