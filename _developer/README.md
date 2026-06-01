# Employee Appreciation Certificates

Premium Health employee recognition certificates — interactive digital version and print-ready layout, based on the [Claude Design](https://claude.ai/design) handoff bundle.

## Share with others (Tweaks panel works)

1. Run `npm run package` — creates `dist/Premium-Health-Certificate-Share.zip`
2. Send the zip plus `HOW TO USE.txt`
3. Recipients double-click **Open Certificate.command** (Mac) or **Open Certificate.bat** (Windows)

Do **not** send only the old `(standalone).html` file; it is outdated and hides the Tweaks panel.

## Quick start (local development)

1. **Serve the project folder** (required so fonts and JSX load correctly):

   ```bash
   npm start
   ```

2. Open in your browser:

   - **Digital (interactive):** http://localhost:3457/Employee%20Certificate%20-%20Digital.html
   - **Print (letter landscape):** http://localhost:3457/Employee%20Certificate%20-%20Print.html

3. Use the **Tweaks** panel (bottom-right — opens automatically) to edit recipient name, role, award title, citation, signatures, holographic effects, and backdrop. If you closed it, click the **Tweaks** pill in the corner to reopen.

   **Hard-refresh** the page (⌘⇧R) after pulling updates so the browser reloads `tweaks-panel.jsx`.

4. Click **Download PNG** (top-right or in Tweaks → Export) to save a flat 2200×1700px image of the certificate.

## Files

| File | Purpose |
|------|---------|
| `employee-certificate/project/Employee Certificate - Digital.html` | Main editable digital certificate with 3D tilt, holographic sheen, and tweaks panel |
| `employee-certificate/project/Employee Certificate - Print.html` | Letter-size print layout (⌘P / Ctrl+P) |
| `employee-certificate/project/Employee Certificate - Portable.html` | Shareable copy with JSX inlined — open from the `project` folder (keep `fonts/` + `assets/`) |
| `Open Certificate.command` / `Open Certificate.bat` | Double-click launchers — start a local server and open the app |
| `employee-certificate/project/digital-cert.jsx` | React app: certificate UI + export |
| `employee-certificate/project/colors_and_type.css` | Brand tokens, fonts, typography |
| `employee-certificate/chats/` | Design conversation transcript |

## Editing tips

- Wrap words in `*asterisks*` in the **Citation** field to emphasize them in gold italic (e.g. `for *her dedication to patient outreach*`).
- **Download PNG** exports the certificate face only (no stage background), flattened and at 2× resolution.
- For highest print quality, use **Employee Certificate - Print.html** and print to PDF from the browser.

## Brand

Design follows Premium Health brand guidelines: Premium Gold (`#B78449`), cream stock (`#F3EDE6`), Nib Pro display, Alliance No. 1 body, and the secondary gradient palette (purple → blue → green → yellow).
