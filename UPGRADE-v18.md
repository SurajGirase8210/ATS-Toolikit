# AI Career Copilot V18

UX, performance and AI-assistant polish on V17.

## Included
- Scrollable hamburger menu with max-height, overscroll containment, thin scrollbar, Escape-to-close, body scroll lock and active-route highlighting.
- Global Career Copilot chat assistant with an 8-second AI timeout, compact conversation history, local fast-path answers, simple rate limiting and safe fallback messaging.
- Gemini chat uses the direct `generateContent` endpoint and keeps the API key server-side.
- Global chat is dynamically loaded with `next/dynamic` to reduce initial page JavaScript.
- Simple Create Account screen reduced to email + password. Full name is no longer required during signup.
- Sample data buttons added to Career Gaps, Recruiter View, Cover Letter, Interview Prep, Career Profile and Tracker.
- Global scrollbar, reduced-motion support and small rendering polish.

## Important
Run `npm install` in the project folder before testing. A full production build was not completed in the build environment because dependency installation timed out, so run `npm run build` locally before deployment.
