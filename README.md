# Rinkside

A browser and phone hockey timekeeper training simulator with six controller profiles. No build or dependencies are required.

- Live site: https://rink-timekeeper.tinyaphid17.chatgpt.site
- Visual controller library: `dist/controllers.html`
- Serve locally: `python3 -m http.server 8080 --directory dist`
- Verify behavior: `node --test tests/*.test.js`

| Profile | Page | Guided lessons |
| --- | --- | ---: |
| Daktronics All Sport 5000 inspired | `dist/index.html` | 43 |
| Hamilton VisionTime | `dist/hamilton.html` | 56 |
| Hamilton HDD 2000 PR95019A/PR95022A | `dist/hamilton2000.html` | 69 |
| OES ISC9000, J12 hockey overlay | `dist/isc9000.html` | 42 |
| Nevco MPC, hockey configuration code 871 | `dist/nevco.html` | 42 |
| OES ISC85X hockey overlay | `dist/isc85x.html` | 41 |

Each lesson loads a prepared scenario, checks actual controller state, and supports independent selection, restart and session progress. Topics filter the lesson list. Larger screens show the scoreboard beside the physical console; narrow screens scroll the console horizontally so the button positions stay recognizable. Sound starts on, with held horns and keyboard operation.

## Controller fidelity

The three additional panels use real controller photographs and manufacturer-authored operating instructions. Their displays, key groups, numeric order, switches, and color coding are recreated in HTML/CSS. The library includes photographs for OES/Nevco and illustrations for the original profiles. Photo/source comparison is available inside each new simulator. See [SOURCES.md](SOURCES.md) for provenance and configuration decisions.

The OES profiles support four penalty rows per team, two active rows, queue release, corrections, shots, intermission and repeating shift timers. The ISC9000 additionally supports queue hold, penalty stop/run, saved stoppage times and basic team name entry. ISC85X presets add minutes; its shared +1 and right-side rocker preserve the documented workflow.

Nevco uses SET/YES/NO entry, MMSS plus tenths for main time, duration-before-jersey penalty entry, review/edit/insert/clear, goal indicators, shots, timeout timer 0, chronometer display and a simulated handheld switch. Code 871 identifies the hockey configuration; it does not identify an exact MPC chassis generation.

Hamilton 2000 includes 15-entry penalty memories, delayed penalties, misconducts, recall editing, timeouts, warm-up and repeating horn. VisionTime alternate penalties are held previews; queue activation is outside that profile. Daktronics supports the enabled hockey overlay controls, two penalty slots, shots/saves log counters and a simplified timeout.

Independent training aid, with fixed configurations rather than a complete firmware emulator. Inactive keys retain their physical positions, and each profile lists omitted hardware/setup functions. Goals do not automatically cancel penalties. Check the installed overlay, configuration, rink procedures and league rules before operating a real game clock.
