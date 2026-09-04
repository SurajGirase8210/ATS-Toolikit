# ATS Toolkit v8

This pass focuses on the job-search operating system workflow.

## Added
- PDF/DOCX/TXT resume import through a Node parser route
- Structured JD requirement extraction and categorization
- Separate Job Fit and Resume Quality scores
- Match-dimension visualization
- Evidence / anti-keyword-stuffing warnings
- Application outcome analytics on the dashboard
- Resume-version interview-rate signal using existing `resume_id`
- Follow-up email draft from an application card
- Explicit heuristic-score messaging
- Existing reviewable edits, section management, undo/redo, versions and templates retained

## Important
No Supabase migration is required for this upgrade. Existing tables are reused.

## Install
npm install
npm run dev
npm run build
