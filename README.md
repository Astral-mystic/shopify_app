# Purelane — Shopify homepage

A working Shopify theme rebuild of `purelane-homepage.html`: 7 Liquid sections
(Hero, Shop/Product Grid, Best-selling Combos, Bundles, Reviews Rail, Header
Marquee, Navbar), all merchant-configurable from the Theme Editor, all
pulling real Shopify data — plus the layout, template, and config files
needed to actually load and run it as a theme.

```
layout/theme.liquid        → HTML shell, fonts, fixed background, loads navbar + marquee on every page
templates/index.json       → homepage: wires all 5 content sections in order, with default copy
config/                    → minimal settings_schema.json + settings_data.json
locales/en.default.json    → minimal (no section uses the `| t` filter)
sections/                  → 7 sections, each with its own {% schema %}
snippets/                  → 6 shared, reusable pieces (product card, price, icons, review card, scene bg)
assets/                    → per-section CSS/JS + shared tokens (purelane-base.css/.js)
```

Full architecture/dependency-graph writeup, install steps, and a line-by-line
consistency-check log live in-repo — see the comments at the top of
`layout/theme.liquid` and each section's own header comment.

---

## What I'd flag about the original file

- **The whole page is one 1,700-line HTML file** — markup, ~600 lines of CSS,
  and behaviour JS all in one `<script>`/`<style>` blob. Fine for a visual
  spec, not decomposable as-is.
- **The scroll-linked background (`.scenes`/`.water`/`.bub`)** assumes a
  fixed, complete section list, in a fixed order, watched by one script.
  That's the single biggest structural mismatch with how Shopify sections
  actually work (addable/removable/reorderable independently) — see below.
- **~9KB of hand-tuned inline SVG** (turbulence-displaced line paths, bubble
  seed values) sitting directly in markup. Faithful to reproduce, but it's
  dead weight on every page load if not handled carefully — the prototype
  itself seems aware of this (it hides two of the four water layers and all
  bubbles under 760px).
- **No real product data anywhere** — prices, ratings, review counts are all
  typed-in numbers. Expected for a visual prototype, but it means every
  "combo," "bundle tier," and "product" needed a deliberate real-data mapping
  decision rather than a 1:1 port.
- **Ambiguous concepts with no Shopify equivalent** — "combo box" and "bundle
  tier" aren't Shopify objects. Had to invent an approach (real bundle
  product for price/URL + a `product_list` for pictured components) rather
  than translate directly.
- **Accessibility gaps** — decorative elements weren't marked `aria-hidden`,
  some icon-only controls had no accessible name, heading levels weren't
  fully consistent section-to-section. Not wrong for a prototype; wrong to
  carry into production.

## What I changed in the code, and why

| Change | Why |
|---|---|
| Split into 7 sections + 6 snippets + per-section CSS/JS instead of one file | Shopify's unit of merchant control is the section; a monolith can't be added/removed/reordered/duplicated independently |
| Combos/bundle tiers reference a real **bundle product** (product picker) for price/compare-at/URL, plus a separate `product_list` for pictured components | No native "combo" object exists — this is the only way to show a real, correct, always-in-sync price without typing numbers into the theme |
| Product grid pulls from a merchant-picked **collection**; rating badge reads `product.metafields.reviews.rating` and simply doesn't render if absent | Zero fake ratings; degrades gracefully if no reviews app is installed |
| Anchor IDs became a **setting** (`shop`, `combos`, `bundles`, `reviews`, default provided) instead of `{{ section.id }}`-suffixed | A separate Navbar section can't predict another section's generated id; a stable, editable anchor is the only thing a nav link can reliably target |
| Background: one **global fixed layer** (`purelane-scenes-bg.liquid`, rendered once in `layout/theme.liquid`), sections mark themselves with `data-pl-scene="1–4"` | The prototype's version hard-assumes every section exists, in order, watched by one script. This version re-queries `[data-pl-scene]` from scratch on every scroll/section-load event, so it stays correct no matter how sections are reordered, removed, or duplicated in the Theme Editor — same visual result, no fixed-order assumption |
| Reviews marquee & header marquee render each item **twice** (visible + `aria-hidden` loop copy) for the seamless CSS scroll, but `shopify_attributes` only on the first copy | Stamping the same `data-shopify-editor-block` id on two DOM nodes makes "select block" in the Theme Editor ambiguous — found this during the second-pass consistency check, not on first build |
| Added `layout/theme.liquid`, `templates/index.json`, `config/*.json`, `locales/*.json` | The five sections existed but had nothing to load them — Shopify requires this scaffold for a theme to run at all |
| Reduced-motion + mobile perf guards ported at the same breakpoints as the original (`760px` hides two water layers + bubbles; `prefers-reduced-motion` freezes all animation) | Kept the prototype's own performance judgment calls rather than second-guessing them |

## What I'd do with more time

- **Real product images for the hero stage / combo stack / tier pix**, tested
  against actual Shopify CDN aspect ratios instead of the prototype's
  fixed-crop assumptions — likely needs `crop: 'center'` tuning per slot.
- **A proper header/footer section group** (`sections.json`) instead of
  hardcoding Navbar + Marquee into `layout/theme.liquid` — would let a
  merchant swap them per-template if the theme grows beyond the homepage.
- **Automated visual regression** — a headless-browser screenshot diff
  against the prototype at the 7 breakpoints, instead of the manual/
  programmatic checks I could run without a live Shopify store.
- **Real device testing on `backdrop-filter`** — Safari/older Android
  support is inconsistent; I'd want a tested-not-assumed fallback solid
  color for the glass panels.
- **Cart/checkout integration for combos and bundles** — right now "Shop
  bundle" links to the bundle product's page; a real build would wire a
  quick-add-to-cart flow with the component products auto-selected.
- **Metaobject-backed reviews** instead of section blocks, so review content
  can be reused outside the homepage and bulk-imported from a reviews app.

---

## Notes on the AI workflow

**What I delegated:**
## 1. Short notes on my AI workflow

I treated AI as a **sidekick and development assistant, not as the person doing the project for me**. I was responsible for the overall design, deciding what needed to be built, structuring the Shopify theme, integrating the sections, testing the output, and debugging issues.

I used AI to speed up specific tasks such as generating initial Liquid/CSS/JavaScript snippets, suggesting implementation approaches, and helping troubleshoot errors when I got stuck.

Where AI fell short was in **understanding the exact behavior of the Shopify environment**. Some solutions looked correct in the Theme Editor but behaved differently in the actual storefront, particularly with shared CSS, hover states, responsive navigation, and section backgrounds. I had to inspect the DOM, use browser-console tests, identify the actual cause, and adjust the implementation myself.

If I had to build twenty more of these, I would systematise the repetitive parts: create a **reusable Shopify section structure, design-token system, responsive navbar, component templates, validation checklist, and debugging workflow**. This would allow me to spend more time on product and design decisions while using AI to accelerate implementation rather than replace my own development work.

**Where it failed / needed a second pass:**
- The first version of the background system was a **per-section static
  gradient** — a reasonable-sounding simplification that turned out to be
  wrong once "give me the same background as the HTML file" made clear the
  actual requirement was the scroll-crossfade itself, not just "roughly the
  right colors." I should have asked, up front, whether the animated
  background was in scope or flagged the simplification as tentative rather
  than as a settled decision — instead of shipping it, and the person had to
  come back and say "no, the real thing."
- The `shopify_attributes`-on-both-marquee-copies bug wasn't caught until
  an explicit "verify every reference" pass — it's not a broken reference or
  invalid schema, so my first build's own review didn't surface it. It only
  surfaced once I went looking specifically for Theme-Editor-interaction
  correctness, not just "does it render."
- Scope boundaries needed explicit correction more than once (Razorpay: I
  initially needed to ask where it should run, since "add a payment gateway
  to the theme" reads as a coding task but Shopify checkout isn't
  theme-editable at all — that's a platform constraint, not a preference,
  and worth surfacing before writing any code).

**What I'd systematize for twenty more of these:**
1. **A standing checklist run after every file-producing turn**, not just at
   explicit "verify everything" requests: schema JSON validity, tag balance,
   render/asset_url resolution, settings-id cross-reference. This was done
   well when asked directly; it should be the default after *any* section/
   snippet edit, since regressions are cheap to introduce and cheap to catch
   automatically.
2. **Flag simplifications as simplifications at the moment they're made**,
   with an explicit one-line "this trades X for Y, tell me if that's wrong"
   — rather than presenting a deliberate scope-cut as a finished decision
   and waiting to be corrected. The background system is the clear example;
   it cost a full extra round-trip that a single flagged caveat up front
   could have pre-empted.
3. **A fixed "platform capability check" before any integration request**
   (payment gateways, apps, checkout customization) — Shopify has hard
   platform boundaries (closed checkout, no custom payment code, section
   vs. layout vs. template scope) that look like implementation details but
   are actually fixed constraints. Worth checking against current docs
   before writing code, not after.
4. **Keep prototype-fidelity extraction literal, not re-derived** — for
   pixel/path/timing-level values (SVG paths, gradient stops, animation
   durations), copy from source rather than re-approximate. Re-deriving
   "close enough" values is where visual drift creeps in across a multi-turn
   build.
