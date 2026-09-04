# ATS Toolkit v5

## Fixed
- Saved resumes now load through a user-scoped query and open in edit mode.
- Save Resume updates the existing record when editing instead of always inserting a duplicate.
- Resume Library now shows an Edit action and updated timestamp.
- Template previews are genuinely different instead of using the same generic thumbnail.

## New
- Optimizer has "Edit Resume According to Changes".
- ATS findings are carried into Resume Builder as reviewable changes.
- Missing structural sections can be added as editable placeholders.
- Meaningful missing/low keywords can be reviewed and selectively added to Skills.
- Original resume text from the optimizer is carried into the builder and parsed into common sections when possible.
- 20 templates now have distinct header, section, density and layout styles.

## Important
Do not rerun the existing Supabase migration. The current `resumes`, `job_applications`, and `ats_analyses` tables are already in use.
