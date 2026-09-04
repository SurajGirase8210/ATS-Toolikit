# ATS Toolkit Advanced v14

## Fix: Smart Resume Editor visual instructions

- Added a dedicated `section.summary.size` design property.
- Prompts such as `make summary bigger`, `increase summary font size`, and `make the professional summary larger` are now handled locally and immediately.
- Applying the change updates the live preview and persists the design settings.
- The fallback path now preserves local visual edits instead of replacing them with generic ATS suggestions.
- Updated rules-mode messaging so it no longer incorrectly implies that a local visual edit cannot work without Gemini.
- Project title formatting remains controlled and bold by default.
