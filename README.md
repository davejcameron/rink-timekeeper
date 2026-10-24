# Rinkside

Responsive hockey timekeeper simulator inspired by the Daktronics All Sport 5000.

Serve `dist` with any static server (`python3 -m http.server 8080 --directory dist`). No build or dependencies required.

Includes MMSS clock entry, jersey/time penalty entry, two penalties per team, manual penalty enable/disable, scores, periods, a timeout, horn, keyboard controls, variable simulation speed, operator log and seven guided drills.

Independent training aid, not an exact overlay or firmware replica. See the in-app realism notes and manufacturer documentation: https://www.daktronics.com/en-us/support/controllers/all-sport-5000 . Confirm rink equipment and league procedures before operating a live clock. No automatic penalty cancellation after goals, penalty queue, or main-clock/penalty-time correction.

## Hamilton / KMHA mode

Open `dist/hamilton.html` or use the controller tabs. Based on the Hamilton Digital Designs quick-start sheet at https://kitchenerminorhockey.com/Pages/41980/Score_Clock_Instructions/ . Includes separate-field game setup, RECALL corrections and penalty deletion, intermission, Toronto time of day, team names, count-up/down and eleven drills. The physical layout and name-entry alphabet are representative. ALT PEN is a held-timer preview; queueing and activation of alternate penalties are omitted.

Run behavior checks with `node --test tests/hamilton.test.js`.
