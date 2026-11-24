# Plan

The site is live at phonletai.com, served by GitHub Pages. Open work, lowest first:

- [ ] Add the benchmark page once a recognition benchmark exists (no comparative accuracy claims
      before it).
- [ ] A 30-second video of the ESP32-S3 demo.

## Done

- [x] 2026-11-24 Hugging Face: the footer links GitHub and the phonletai organisation, and
      `agents.md` and `llms.txt` link the `en-1` model and the lab Space (`lib/release.ts`).
      Verified: `npm run check`, build, Playwright 16 passed.

- [x] 2026-11-24 The generator loads on GitHub Pages: Pages gzips the 18.7 MB module, so its
      Content-Length is the compressed size and the worker's preallocated buffer overflowed
      ("source array is too long"). The worker now collects the chunks; `scripts/serve.mjs` gzips
      like Pages so the browser tests cover it (the old worker failed them, the new one passes).
      The standalone `/examples/wake.html` is gone: the lab runs the SDK live and the release has
      a complete web demo. Verified: `npm run check`, build, Playwright 16 passed against the
      gzip server.

- [x] 2026-11-24 Compared with openWakeWord and microWakeWord (`/#compare`, a question, and a
      paragraph in `llms.txt`): how a new word is made, models, where each runs and licences, from
      the openWakeWord and microWakeWord READMEs and the Home Assistant blog (2024-02-21), no
      accuracy comparison. Docs pages give the install command for each SDK and where the
      example's model comes from (`lib/release.ts`, shared with `agents.md`). Verified: `npm run
check`, build, Playwright 17 passed (the detection test once flaky under load, then 5/5).

- [x] 2026-11-24 Static site on GitHub Pages: `output: 'export'` with trailing slashes,
      `public/CNAME` and `.nojekyll`, the social image as a static `og.png`, `robots.txt`,
      `sitemap.xml`, `llms.txt` and the new `agents.md` (instructions for AI coding agents: the
      keyword file, release downloads, the code for each platform) prerendered; the browser SDK,
      model and keyword file in one place, `public/wake/`; the generator rebuilt from the released
      source (no CMUdict step); `scripts/serve.mjs` serves `out/` the way Pages does and
      `scripts/deploy.sh` publishes it. The site's server headers are gone (Pages sets none); the
      referrer policy moved into the page metadata.

- [x] 2026-11-24 Footprint at the top: a hero readout (1 MB model, 1.05 MB of memory while
      listening, 0.7% of a laptop core, 19% of an ESP32-S3 core) and a Footprint section with
      memory and CPU meters, the last one measured live in the visitor's browser. Sources:
      model.pwake 1,013,825 bytes; memory from glibc mallinfo2 around `phonlet_wake_init_bytes`
      and 5 s of audio through the C API on Linux x64 (1,044 KB session, 1,076 KB after audio,
      four site phrases; 8 phrases 1,043 KB, 64 phrases 1,126 KB, so about 1.5 KB per phrase);
      CPU from the Python SDK on 327 s of speech, best of three, 2.25 s on an AMD Ryzen 7 7735HS
      (0.69%); WebAssembly in headless Chromium on the same machine 2.6 ms per 32 ms frame (about
      8%, scalar and SIMD alike); ESP32-S3 figures from the wake repository's
      `sdk/esp32/wake/README.md` (board measurements of 2026-10-31). The comparative line "smaller
      than any other model" was not used: per-word models trained elsewhere can be smaller, and no
      benchmark exists yet.

- [x] 2026-11-24 Copy pass, one shipped product: no "early access" or "coming soon" anywhere; the
      main call to action is Get started (docs); each SDK page and the ESP32-S3 guide end with one
      Get-the-SDK block that links the latest GitHub release; the docs describe the lab, the
      generator and the keyword file; the generator page shares the hero's stage and the lab's
      download progress.

- [x] 2026-11-24 Redesign, lean and product-only: the home page is a live lab (type any phrase,
      calibrated in the browser by the WebAssembly generator, heard by the browser SDK on the
      microphone, keyword file to download) over an animated signal canvas, then how it works,
      numbers, developers (keyword file, platforms, code tabs), ESP32-S3, licence (PolyForm
      Noncommercial 1.0.0), questions. Browser samples, the standalone example and the browser
      docs use the SDK at `/wake/`. Tests: `lab.spec.ts` (site phrases and sounds, a typed phrase
      calibrated and downloaded, microphone released on navigation, a detection end to end with a
      permissive test phrase), samples run unchanged, axe on every page at 390 and 1440 px in both
      themes, no horizontal overflow.

- [x] 2026-11-24 `/generator`: type phrases, get the keyword file (pronunciations, thresholds,
      source per phrase, warnings), download or copy it, and try it live with the microphone. The
      threshold generator runs as WebAssembly in a worker (`public/generator/`). Chromium with a
      synthesized recording as the microphone: four phrases including two the dictionary lacks
      generated in 11.9 s on first use (download included) and 2.0 s after; the live test detected
      hey kettle, zorblax and hey marvin at 3.01, 7.26 and 11.49 s.

- [x] 2026-10-31 Inline phrases in every SDK example, each run against its SDK on a synthesized
      "hey kettle" recording (Node.js, Python, C; the Android JSON through the JVM SDK; ESP32-S3 on
      the board); docs per platform; `/llms.txt`; platform cards with outline drawings and code
      tabs; ESP32-S3 figures measured on hardware.
- [x] 2026-10-01 to 2026-10-31 Site, themes, live waveform, accessibility foundations, the brand.
