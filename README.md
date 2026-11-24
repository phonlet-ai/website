# Phonlet website

The site of **Phonlet Wake**, at [phonletai.com](https://phonletai.com): custom wake words made from
text, calibrated automatically, running on the device. It has a live in-browser lab on the real
Phonlet Wake engine, the threshold generator in the browser, a code example for each platform,
developer docs, and two Markdown files for AI tools: `/llms.txt` (the docs) and `/agents.md`
(step-by-step instructions for coding agents).

Phonlet Wake itself (engine, model, SDKs, generator) lives in
[phonlet-ai/wake](https://github.com/phonlet-ai/wake).

## Run

Requires Node.js 24 and npm.

```bash
npm ci
npm run dev          # http://localhost:3002
```

```bash
npm run check        # strict TypeScript, asset hashes, engine golden tests
npm run build        # static export into out/
npm start            # serve out/ on port 3002 the way GitHub Pages does
npm run test:e2e     # browser tests against the running server
```

Install Chromium for the browser tests once with `npx playwright install chromium`. The tests use a
synthetic microphone, one worker and the server at `TEST_BASE_URL` (default
`http://localhost:3002`).

## Pages

| Route                 | Content                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | The lab (`/#lab`), footprint, how it works (`/#how`), developers (`/#developers`), ESP32-S3, compared with openWakeWord and microWakeWord (`/#compare`), licence, questions |
| `/generator/`         | Many phrases at once: the keyword file as a table and JSON, download, live test                                                                                             |
| `/docs/`              | Getting started, browser quickstart, Node.js, Python, C / C++, Android, ESP32-S3, custom wake words, audio lifecycle                                                        |
| `/llms.txt`           | The docs as Markdown for AI assistants, built from the same source as the pages                                                                                             |
| `/agents.md`          | Instructions for AI coding agents: make the keyword file, download the SDK, the code for each platform                                                                      |
| `/contact/`           | Licence enquiry, prepared in the browser (download, copy, or open in an email app)                                                                                          |
| `/privacy/`           | What the lab does with audio, theme storage, site requests                                                                                                                  |
| `/wake/`              | Stable paths used by the code samples: the browser SDK (`index.mjs`, `capture.mjs`), `model.pwake`, `keywords.json`                                                         |
| `/examples/wake.html` | Standalone wake example on the same SDK                                                                                                                                     |

Light and dark palettes follow the system until the visitor picks one, which the browser
remembers; the hero and the ESP32-S3 section are dark in both.

## The lab

The hero is the product: the phrases in `public/wake/keywords.json` are ready at once, and any
phrase typed into the lab is calibrated in the browser by the threshold generator
(`public/generator/`, 18.7 MB of WebAssembly, loaded on the first custom phrase). Start listening
runs the Phonlet Wake browser SDK (`public/wake/`, scalar or SIMD WebAssembly in a worker) on the
microphone; audio never leaves the tab, and every track, context and worker stops on stop and on
navigation. `keywords.json` downloads the visitor's phrases for any SDK.

## Configuration and deployment

`.env.production` holds the public settings, none of them secret: `SITE_URL` (sitemap, robots,
social metadata), `CONTACT_EMAIL` (the contact form's "Open in email app" button; the site sends
nothing) and `REPO_URL` (the docs link its latest release).

The site is a static export (`output: 'export'`, trailing slashes) served by GitHub Pages from the
`gh-pages` branch, with `public/CNAME` for the domain and `public/.nojekyll`. To publish, commit,
then:

```bash
npm run build
npm run deploy       # pushes out/ to gh-pages as a single commit
```

GitHub Pages cannot set custom response headers (such as a Content-Security-Policy); the site sets
its referrer policy in the page metadata. The microphone needs HTTPS outside localhost.

## Licence

The site's code is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). The files
under `public/wake/` and `public/generator/` are Phonlet Wake release files under the same licence,
with their own `LICENSE` and `THIRD_PARTY_NOTICES.md`.
