# Vivien Alba portfolio: deploy to GitHub Pages

This package contains the complete current website, including all recent typography, menu, quote, footer, and animation updates. It uses HTML, CSS, JavaScript, and self-hosted Anime.js. No npm install or build is needed.

## Upload through GitHub

1. Extract the ZIP on your Mac. Upload the extracted contents, not the ZIP.
2. Create a new public repository on GitHub. Example name: `fva-portfolio`. A public repository works with GitHub Free. For a new empty repository, leave the initial README, .gitignore, and license options unchecked.
3. Open the repository and select **uploading an existing file**, or **Add file → Upload files**. Drag in `index.html`, the complete `assets` folder, the four policy HTML files, `README.md`, and `.nojekyll`.
4. Keep `index.html` directly at the repository root, alongside `assets`. Do not upload the enclosing download folder. On a Mac, press **Command + Shift + .** in Finder to show `.nojekyll` before uploading.
5. Commit the upload to `main`. If GitHub creates a pull request, merge it into `main` first.
6. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, then **Save**.
7. Wait for the Pages deployment to finish in the **Actions** tab. Open the live address shown in **Settings → Pages**.

If your username is `vivienalba` and the repository is `fva-portfolio`, the resulting address is:

`https://vivienalba.github.io/fva-portfolio/`

This is an example address for your future GitHub deployment. The website has not been uploaded to GitHub by this export.

## Optional Terminal upload

Use this alternative after creating an empty GitHub repository. Run it inside the extracted folder that contains `index.html`. Replace the remote URL if you choose a different repository name.

```bash
git init
git add .
git commit -m "Add Vivien Alba portfolio"
git branch -M main
git remote add origin https://github.com/vivienalba/fva-portfolio.git
git push -u origin main
```

Complete step 6 above to enable Pages. GitHub may ask you to authenticate the push using your existing Git setup or GitHub Desktop.

## Website files

| File | Purpose |
| --- | --- |
| `index.html` | Main page, content, menu, and project cards |
| `assets/style.css` | Fonts, colors, layout, and hover effects |
| `assets/app.js` | Anime.js interactions, dialogs, filters, and menu behavior |
| `assets/data.js` | Project popup content and the sample data-cleanup demo |
| `assets/inquiry.js` | Direct inquiry submission, validation, loading and error handling |
| `assets/` | SVG objects, project screenshots, fonts, and Anime.js |
| `privacy.html`, `terms.html`, `cookies.html`, `refunds.html` | Policy pages |
| `.nojekyll` | Serves the static files without Jekyll processing |

Keep the folders and filenames intact. The relative asset paths work both on a GitHub project URL and a custom domain. Keep the included font and Anime.js license files. No custom domain is configured in this package.

## Preview and update

To preview locally, open Terminal in this folder and run:

```bash
python3 -m http.server 8080
```

Visit `http://localhost:8080`. Serve the files over HTTP so JavaScript modules load correctly.

For future edits, update the files in your repository and commit to `main`. Project cards use `index.html`; their popup descriptions use `assets/data.js`, so update both when changing project copy.

If the site shows a 404 or only this README, check that `index.html` is at the root and Pages uses **main / (root)**. If images are missing, check that the whole `assets` folder was uploaded without renaming anything. Check **Actions** for a failed Pages deployment.

## Official instructions

- [GitHub Pages publishing settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Upload files to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## Font update

Computer Says No by Christian Munk is bundled locally, unchanged, under CC BY-SA 3.0. The font license and attribution are in `assets/fonts/`. Headings request Helvetica Now Condensed when installed locally and use Nimbus Sans Narrow as a temporary fallback. To render Helvetica Now Condensed for every visitor, add your licensed WOFF/WOFF2 webfont and update its `@font-face` source in `assets/style.css`; no Helvetica Now font file is bundled.

The black clip, pink gummy bear, and dog are extracted from the supplied SVG artwork.

## Current design settings

Section headings use title case. Work-history titles are smaller, and accordions start closed. The name and fva logo are enlarged. The binder clip is 76px on desktop, 60px on mobile, and 50px on small screens. The toolbox note uses 32px on desktop and 28px on mobile.

Every project cover is labeled FROM THE VAULT, with no name, footer caption, or arrow overlay inside the box. Projects use a compact horizontal carousel with mouse dragging and native touch swiping. The previous/next arrow buttons have been removed, and the horizontal scrollbar is hidden. Dragging, touch swiping, and keyboard navigation remain available. Focus the carousel and use Left, Right, Home, or End. A drag does not open a project, and category filters return to the first matching project. Reduced-motion preferences are respected.

Tool category buttons use 32px text on desktop and 28px on mobile, with slightly larger icons. Selected tool panels use 32px tool names on desktop and 28px on mobile, with 24px category labels. The desk note sits farther left beneath the shell on desktop. On mobile it stays in the left column with tighter line spacing and an upward arrow clear of the apple. The credential collection has smaller cards, 150px certificate previews on desktop, smaller titles, and reduced spacing. The quote is centered in a smaller sticky note. Header and mobile navigation text use 22px, with the fva and project-heading stars removed and Inquire shown without its arrow. Footer SVG icons are 34px, GitHub is 28px, and the icon gaps are 10px on desktop and 8px on mobile; their 48px clickable areas are retained.

Computer Says No paragraphs remain 25px and other text remains 20px, except the explicitly enlarged elements. Helvetica Now Condensed uses the bundled condensed fallback until your licensed webfont is added. White sections use #f6f1f0 with #bfcece grids; black sections use #000000 with #3d3d3d grids. Pink sections use #f965d6 with no grid. The inquiry footer uses a solid paper background to match the supplied form reference. Top padding is reduced to 40px on desktop and 32px on mobile. Its bottom row aligns copyright left, policy links center, and all four social icons right, with a single inset divider. On mobile, policy links sit below the copyright and icons. On small screens, the icons get their own row so the touch targets fit without crowding. The separate Back to the desk row has been removed to reduce the gap above this footer.

## Activate inquiry email delivery

The footer contains a name, email address, and message form, with required privacy consent. Field labels are visually hidden while remaining available to screen readers; placeholders remain inside the boxes. The footer heading is reduced to 60px on desktop, 46px on mobile, and 42px on small screens. Inquiries are addressed to vivienalba1016@gmail.com through FormSubmit. The header Inquire button scrolls to this form. With JavaScript enabled, visitors stay on the page while sending. No email app opens. If JavaScript is disabled, the native POST form opens FormSubmit’s confirmation page.

1. Open the deployed website and submit one test inquiry using your own name and email address.
2. Check vivienalba1016@gmail.com, including Spam, for FormSubmit’s activation email. Confirm the activation link.
3. Submit another test inquiry and check that it arrives. Email delivery has not been tested live or activated by this export.
4. After deploying to a different URL, repeat the test and confirm any activation email you receive.

Only a positive response from the form service is shown as a successful submission. Network failures, timeouts, or activation requirements keep the visitor’s entered details. Submissions are not stored in the browser. FormSubmit states it retains submissions for 30 days; the portfolio privacy and cookie pages explain the service and the form’s data use. The visible email address can be replaced with FormSubmit’s opaque recipient identifier after activation if desired.

Official service instructions: https://formsubmit.co/ and https://formsubmit.co/ajax-documentation


## Added motion and mobile interaction

Anime.js 4.5.0 remains self-hosted. The page uses scoped timelines for the hero and section entrances, with interruptible hover, press, menu, and dialog transitions. Seven hero objects float independently by 8–13px with gentle alternating motion. Entrance, ambient motion, and pointer feedback each use a separate nested layer so dragging and hovering do not fight. Ambient motion pauses when objects are grabbed, offscreen, behind a dialog, or in a hidden tab.

Mouse and touch visitors can drag the desk objects. A short tap opens the associated project; a drag does not. The empty desk area still scrolls normally. Reset returns the composition smoothly, and grabbing halfway through reset retains the object's current position. Reduced-motion preferences stop floating and make transitions immediate while retaining interaction and dragging.

The original visual design and page copy are preserved. No underlines, motion switch, project arrows, scroll progress bar, or visible carousel scrollbar have been reintroduced. All 30 automated checks passed. Browser visual layout and physical device interaction could not be checked in this environment. Live inquiry activation and delivery remain subject to the activation steps above.

The landing-page RB19 car opens a destination menu and supports the same drag, reset, hover, and reduced-motion behavior as the other desk objects. The cat appears beside Projects, and the gummy bear beside Certificates & Credentials. The inquiry email is also shown below the tagline.
