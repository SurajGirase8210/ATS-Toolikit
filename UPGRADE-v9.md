# ATS Toolkit v9

## UI polish
- Collapsed navigation into a compact hamburger menu on desktop and mobile.
- Added grouped navigation, overlay dismissal, dashboard/account actions, and cleaner visual hierarchy.
- Added smoother global focus, selection, backdrop, and print styles.

## Interview Prep
- Added resume upload with PDF, DOCX, and TXT parsing using the existing `/api/parse-resume` endpoint.
- Added parsed-file status and loading state.
- Added printable interview preparation output with `Export PDF` using the browser print dialog.
- Added copy-prep action and editable answer notes.

## Exact uploaded resume template
- Added the uploaded one-page resume as `public/templates/surajsingh-girase-exact.pdf`.
- Added a rendered preview image at `public/templates/surajsingh-girase-exact.png`.
- Added an editable `Surajsingh Girase · Exact Reference` template in the template library.
- Selecting the exact reference template from the Templates page seeds the builder with the uploaded resume content and recreates its centered header, blue section rules, compact one-page hierarchy, project bullet structure, and section order.
- Templates page provides an `Open exact PDF` action for the original uploaded file.
