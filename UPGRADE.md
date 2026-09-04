# ATS Toolkit Advanced Upgrade

## Advanced application-management features

The tracker now includes:
- Pipeline/Kanban view across all application stages
- Search across company, role, location, recruiter and notes
- Status and priority filters
- Application statistics: total, interviews, offers, rejected, overdue follow-ups
- Create and edit applications
- Job URL, location, salary, job type
- Recruiter name, email and phone
- Follow-up date with overdue highlighting
- Notes for interview details and next steps
- Delete applications
- CSV export of filtered applications
- Persistent data through the existing `job_applications` Supabase table

## Existing database compatibility

The existing migration already contains the columns used by this tracker. Do **not** rerun the original migration. If your database already contains `ats_analysis`, `job_applications`, and `resumes`, keep it as-is.

## Install/run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Keep your existing `.env.local`. Do not commit it.

## Resume Library + 20 Templates
- `/resumes` is the saved resume library. Every resume saved from the builder appears here.
- `/resume-builder` supports 20 templates, live preview, save, duplicate, and print/PDF.
- Templates include ATS Classic, ATS Modern, Data Analyst, Technical Developer, Fresh Graduate, SQL & BI Specialist, Machine Learning, Software Engineer, Academic/Research, Executive and two human-first two-column options.
- The visual language is inspired by the user's attached single-column resume reference: strong header, compact sections and ATS-readable hierarchy.
