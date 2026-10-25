# Usability verification — 2026-10-25

640 automated tests pass. All 12 profiles checked in 390×844 phone and 1024×768 landscape tablet iframe viewports. No horizontal page overflow; physical console regions intentionally scroll on narrow screens. Test-yourself scenarios visible in all 24 combinations. Rotomatic initial 15:00 and main switch/start interaction verified. These are desktop browser viewport checks, not physical iOS/Android hardware tests.

## Scoreboard-first flow

All twelve profiles checked again at 390×844 and 1024×768 with the new live-board adapter: correct initial clocks, selector present and no horizontal page overflow. H-2111 and H-2107 model layouts checked visually. Their penalty placement and clock state were checked while switching views. Nine exact-model manufacturer renderings are local assets; controller comparisons include labelled reference thumbnails. This remains desktop browser viewport verification.

## Phone period label correction

390×844 browser viewport: representative Daktronics PERIOD caption centered above a 23px period number, below the clock with no overlap. Exact H-2111/H-2107 layouts retain their existing period arrangement. Official Kinsmen venue source is separately catalogued from The Aud main-bowl evidence.

## Shared period layout correction

Replaced the Daktronics-only phone rule with a shared period component across all simulator boards. Browser geometry checks passed for all 12 representative views at 390×844, 1024×768 and 1440×900 (36 cases), plus H-2111, H-2107 and OES M6018CTMV at those same sizes (9 cases). In all 45 cases, PERIOD is above its number, both centers differ by at most 1px, the caption is below the clock, and the page has no horizontal overflow. ISC9000 phone view also visually inspected. Automated suite: 644 tests pass.
