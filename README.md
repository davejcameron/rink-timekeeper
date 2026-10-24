# Rinkside

Responsive hockey timekeeper simulator inspired by the Daktronics All Sport 5000.

Serve `dist` with any static server (`python3 -m http.server 8080 --directory dist`). No build or dependencies required.

Includes MMSS clock entry, jersey/time penalty entry, two penalties per team, manual penalty enable/disable, scores, periods, a timeout, horn, keyboard controls, variable simulation speed, operator log and seven guided drills.

Independent training aid, not an exact overlay or firmware replica. See the in-app realism notes and manufacturer documentation: https://www.daktronics.com/en-us/support/controllers/all-sport-5000 . Confirm rink equipment and league procedures before operating a live clock. No automatic penalty cancellation after goals, penalty queue, or main-clock/penalty-time correction.

## Hamilton VisionTime

Open `dist/hamilton.html` or use the controller tabs. Based on the Hamilton Digital Designs manual at https://cloud.rampinteractive.com/greatervictoriaminorballhockey/files/Information%20Documents/Clock%20Instructions/panorama_rinkB_clock_instructions_fullversion_april2018.pdf . Includes separate-field game setup, RECALL corrections and penalty deletion, intermission, Toronto time of day, team names, count-up/down and eleven drills. The panel arrangement and telephone-style keypad follow the manual’s Figure 1 (page 6). ALT PEN is a held-timer preview; queueing and activation of alternate penalties are omitted.

Run behavior checks with `node --test tests/*.test.js`.

## HDD 2000 series

`dist/hamilton2000.html` is a separate PR95019A/PR95022A hockey profile based on https://erra.ncrrl.on.ca/Resources/HDD_2000series_Manual.pdf (90-19-009). Includes period/setup differences, HOLD PEN MEM, 15-penalty memory, delayed penalties/misconducts, recall penalty editing, shots, timeouts, intermissions, warm-up, repeating horn and abort. Representative layout; hardware setup, printing, serial interfaces and other sports are excluded.

## Layout references

Hamilton 2000: manual 90-19-009, page 10. VisionTime: manual MN04009E, page 6 (Figure 1). Cross-checked against https://nesc-timekeeping.fandom.com/wiki/HDD_2000_Series/HDD_VisionTime_Series . Daktronics: manufacturer LL-2436 hockey overlay. Controller layout preserves relative positions; narrow screens scroll the panel. Images are linked as references, not redistributed.

### Guided tutorials

Choose any topic directly: 43 Daktronics, 56 VisionTime, and 69 HDD 2000-series lessons. Each loads an independent prepared game, checks the resulting controller state, and supports restart and session completion tracking. Topics cover all enabled controls, including advanced 2000-series penalty memory, display modes, sound, shortcuts and practice tools. Inactive hardware controls remain outside the simulator scope.
