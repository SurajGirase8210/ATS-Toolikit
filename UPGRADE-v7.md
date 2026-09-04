# ATS Toolkit Advanced v7

This version adds the requested product-level polish and advanced workflow features.

## Added
- Evidence-first Master Career Profile with tagged, reusable career evidence stored locally.
- Semantic/concept alignment layer in ATS analysis. This is deterministic heuristic matching, not a claim of true embedding similarity.
- Resume ↔ JD match map with concept-level matched/gap visualization.
- Tone/bias-style review for passive/hedging language, vague claims and tense consistency.
- Explicit ATS warning when a two-column template is selected.
- Undo/redo in Resume Builder with a local audit trail foundation.
- Interview Prep workspace generated from the JD + resume.
- Navigation links for Career Profile and Interview Prep.
- Existing reviewable ATS edit workflow retained.
- Existing 20-template system, resume library, versioning, section management, application tracker and cover-letter workflow retained.

## Trust model
The analyzer is directional and heuristic. It does not know a company's private ATS ranking model and must not be presented as a guarantee of an interview.

## Deferred larger integrations
- Real embedding provider for semantic similarity
- Anonymized benchmark dataset of interview-winning resumes
- Browser extension
- Automated email/calendar notifications
- Mentor share links with commenting
- Salary market-data negotiation assistant
- DOCX/PDF import and round-trip fidelity parser
- Team/career-center multi-user administration

These require external services, additional schema/security work, or reliable datasets and should not be faked as local heuristics.
