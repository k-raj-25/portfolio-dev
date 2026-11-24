# Kamal Rajput · Portfolio

Static portfolio site for Kamal Rajput, freelance developer (websites and automation).

No build step: plain HTML, CSS and JavaScript, ready for GitHub Pages or any static host.

## Structure

```
index.html                 Home: shader hero, CRM showcase, services bento, case studies, contact
work/*.html                Case study pages
assets/css/style.css       All styles (dark theme, design tokens at the top)
assets/js/main.js          Interactions: WebGL shader, text rotate, scroll tilt, glowing cards,
                           accordion, globe, clock, contact form, curtain footer
assets/favicon.svg
404.html
```

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Contact form

The "Request a call" form posts to [FormSubmit](https://formsubmit.co) using the email address in the form's `action` attribute in `index.html`. No account is needed. The **first** submission sends a confirmation email to that address. Click the link in it once, and every request after that is delivered to the inbox.

## Editing content

- Case study copy lives in `work/*.html`. Each page has a `TODO(Kamal)` comment where real details, screenshots and the tech stack go.
- Colors and fonts are defined as tokens at the top of `assets/css/style.css`.
