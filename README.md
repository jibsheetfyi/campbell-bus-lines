# Campbell Bus Lines — campbelltours.com

Static marketing site for Campbell Bus Lines, Slippery Rock, PA.
Family owned and operated for over 54 years. Prevost H3-45 and Temsa TS 30 motorcoaches.

## How this site is built

The pages in `site/` are **generated**. Do not edit the HTML by hand — your changes
will be overwritten on the next build.

- `build.py` — the generator. All page structure and copy live here.
- `site/styles.css` — hand-written stylesheet (edit directly).
- `site/main.js` — nav, theme toggle, scroll reveals, form handling (edit directly).
- `site/assets/` — photographs and video.

To rebuild after editing `build.py`:

```bash
cd site && python ../build.py
```

## Local preview

```bash
cd site && python -m http.server 3210
# open http://127.0.0.1:3210
```

## Deployment (Render)

Static site, no build step required at deploy time — the generated HTML is committed.

- **Publish directory:** `site`
- **Build command:** (leave empty)

Pushing to `main` triggers an automatic redeploy.

## Notes

- Contact, charter quote, and driver application forms currently open the visitor's
  mail client via `mailto:` to tc@campbelltours.com. Replacing these with a hosted
  form endpoint (Formspree) is a pending task.
- Site is white / black / Olympic blue per the company paint chart
  (Olympic Blue = 220-57 ScotchCal 3M).
