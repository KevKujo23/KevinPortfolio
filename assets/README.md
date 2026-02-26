# Kevin Portfolio (GitHub Pages Static Site)

Recruiter-focused one-page portfolio website built with plain `HTML`, `CSS`, and `JavaScript` for easy hosting on GitHub Pages.

## What This Includes

- Single-page portfolio layout (hero, about, projects, skills, contact)
- Responsive design for mobile/tablet/desktop
- Accessible navigation and focus states
- Content-driven rendering via `assets/js/content.js`
- GitHub Pages-friendly static file structure (no build step)

## Project Structure

```text
.
+-- index.html
+-- README.md
`-- assets
    +-- css
    |   `-- styles.css
    +-- img
    |   +-- profile-placeholder.png
    |   +-- project-1-placeholder.svg
    |   +-- project-2-placeholder.svg
    |   `-- project-3-placeholder.svg
    `-- js
        +-- content.js
        `-- main.js
```

## Where To Edit Content

Primary content lives in `assets/js/content.js`.

The site reads from `window.PORTFOLIO_CONTENT = { ... }`.

### Required fields

- `name`
- `title`
- `tagline`
- `email`
- `links.github`
- `links.linkedin`
- `links.resume`
- `about` (array of 2-3 paragraphs)
- `skills` (array)
- `projects` (array of 3 featured projects)

### Project object shape

Each project should look like:

```js
{
  name: "Project Name",
  summary: "Outcome-focused summary",
  tech: ["React", "Node.js", "PostgreSQL"],
  repoUrl: "https://github.com/...",
  liveUrl: "https://example.com", // optional
  image: "assets/img/project-1-placeholder.svg", // optional
  highlights: [
    "What you improved",
    "How you built it",
    "Why it mattered"
  ]
}
```

### Optional fields

- `location`
- `focus`
- `availabilityPill`
- `availabilityNote`
- `profileImage`
- `typedRoles`
- `skillGroups` (grouped skills rendering)
- `experience` (shows Experience section when provided)
- `certifications`

## Where To Edit Styles

- `assets/css/styles.css`: colors, layout, spacing, buttons, cards, responsive behavior

Look for CSS custom properties in `:root` (colors, spacing, radii, typography).

## Where To Edit Behavior

- `assets/js/main.js`: rendering, mobile nav toggle, active section highlighting, reveal animations

## Local Preview (No Build Tools)

You can open `index.html` directly in a browser, but using a simple local server is better for testing links/assets.

### Option 1: Python (if installed)

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

### Option 2: VS Code Live Server

Use the Live Server extension and open the project folder.

## GitHub Pages Deployment (User Site)

To publish at `https://<your-github-username>.github.io/`:

1. Create a GitHub repository named exactly `<your-github-username>.github.io`.
2. In this project folder, initialize git:
   ```bash
   git init -b main
   ```
3. Add files and commit:
   ```bash
   git add .
   git commit -m "Initial portfolio site"
   ```
4. Connect your remote:
   ```bash
   git remote add origin https://github.com/<your-github-username>/<your-github-username>.github.io.git
   ```
5. Push:
   ```bash
   git push -u origin main
   ```
6. Visit `https://<your-github-username>.github.io/`.

GitHub Pages user sites often deploy automatically from the root of the `main` branch. If not, check the repo's Pages settings and ensure deployment is configured for the default branch.

## Project Site Fallback (Optional)

If you do not want to use a user-site repo yet, you can host this as a project site (`https://<username>.github.io/<repo-name>/`).

This project uses relative asset paths, so it should work without code changes in most project-site setups.

## Placeholder Asset Notes

- Replace `assets/img/profile-placeholder.png` with a headshot (optional).
- Replace `assets/img/project-*.svg` with real screenshots or preview images.
- If a project `image` field is blank, the site will render a built-in visual placeholder card automatically.

## Recommended Next Edits

1. Replace the placeholder text and links in `assets/js/content.js`.
2. Add real project screenshots to `assets/img/`.
3. Update the `<your-github-username>` values before publishing.
