# Piano Grid

A responsive, static website for Piano Grid, a daily piano note-training experience. The published repository contains only website files; the separate React Native mobile app stays in the parent project and is not part of this website repository.

## Website

The site is plain HTML, CSS, and JavaScript. It includes a responsive landing page, a playable one-octave note-finding exercise with browser-generated tones, local progress and XP, broad workbook practice groups, and responsive navigation. Progress is stored in the current browser using `localStorage`.

The Grid Coach content is a static learning tip. There is no live AI service, login, cloud sync, or hosted PDF in this website. The source workbook was visually reviewed as a 72-page scan without a searchable text layer. The page ranges are broad practice groupings, not claimed chapter boundaries. Learners need to open their own copy of `Notation Workbook.pdf` to view the referenced pages.

## Run locally

Open `index.html` in a modern browser, or serve the folder locally:

```sh
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish to GitHub Pages

1. Create a **public** repository named `piano-grid-website` under `aaron-samuvel`.
2. Push this website-only repository to its `main` branch. Its current Git history is scoped to this folder.

   ```sh
   git init
   git add .
   git commit -m "Build Piano Grid website"
   git branch -M main
   git remote add origin https://github.com/aaron-samuvel/piano-grid-website.git
   git push -u origin main
   ```

3. In the new repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
4. The included workflow deploys on each push to `main`. After its first successful run, the site will be at:

   `https://aaron-samuvel.github.io/piano-grid-website/`

## Mobile app

The React Native/Expo mobile app is maintained separately from this website-only repository. See the parent project's `README.md` for its current features, limitations, and build instructions. The Android app has not been included in this Pages deployment.
