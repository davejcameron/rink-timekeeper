# Controller reference sources

Research checked 2026-10-24. Photos are used as identification/reference material with links and credits in the site. Copyright remains with the respective owners. No manufacturer or association endorsement is implied.

## OES ISC9000

- Manufacturer-authored manual, revision ISC9000_j12.0_1.3, 2021-10-21: https://cloud.rampinteractive.com/burlingtonringette/files/Arena_instructions/ISC9000-UserManual_J12_1.3.pdf
- Manufacturer product and manual links: https://www.oes-scoreboards.com/product/isc-9000-x9/
- Port Elgin console photograph, Saugeen Shores Minor Hockey: https://ssmha.com/Pages/10492/How_to_Run_the_Clocks/
- Photo file: https://ssmha.com/public/images/common/galleries/14309/PortClock.jpeg → `dist/assets/oes-isc9000.jpg`
- Cross-check: https://erra.ncrrl.on.ca/Resources/OES_ISC9000_QuickRef.pdf

The 4×8 hockey function positions, telephone keypad and separate HORN/RUN/STOP group follow the Port Elgin photo. Manual printed pages 20–27 cover names, clock entry, saved time, intermission, period, shift, scores, penalties and shots. This trainer selects four penalties/two active, queue hold and penalty stop/run enabled, a manual break clock and shift timer. SAVES/TOL and installation controls are visibly inactive; names omit display-size/default-name programming. Saved time requires a hold. No radio, external goal-light output or installation configuration is simulated.

## OES ISC85X

- Local rink instructions and photo, Nepean Minor Hockey Officiating Program: https://www.nmhop.ca/arena-clocks
- PDF: https://www.nmhop.ca/_files/ugd/7141f6_ee1b5e22c96840a6bf0f3b2d084118de.pdf
- Manufacturer-authored hockey instruction sheet, hosted by ManualsLib: https://www.manualslib.com/manual/2811294/Oes-Isc85x.html and page 2
- The photo embedded on page 2 of the Nepean PDF was extracted without generating or altering the depicted controller → `dist/assets/oes-isc85x.jpg`.

The local photograph is a cropped detail; use the OES instruction sheet to verify the full key arrangement. Preserve the left HOME/VISITOR/preset group, middle 2×4 functions, 789 numeric pad and right rocker/horn. Follow the local two-CLEAR penalty removal sequence. Four penalty rows/two active, shots and shift enabled; play-timer and installation setup are inactive. Presets add to selected minutes. The final game time field is hundredths according to the OES hockey sheet (the local guide calls it milliseconds).

## Nevco MPC, code 871

- Manufacturer-authored operator manual 135-0066, 2009-07-16: https://erra.ncrrl.on.ca/Resources/Nevco_871_Full.pdf
- Ontario operating example: https://leagues.teamlinkt.com/kemptvillehockey/TimeClockInstructions
- Photograph, South St. Paul Youth Hockey volunteer reference: https://sspyha.pucksystems2.com/page/show/4845-volunteer
- Photo file: https://cdn2.sportngin.com/attachments/photo/3078/8617/hockey_156.jpg → `dist/assets/nevco-mpc.jpg`

The manual cover and photo establish two 4×5 key groups, SET/YES/NO, calculator-style digits and the red LED strip. Printed pages 1–10 cover startup and core operations. 871 is a model/configuration code on the hockey overlay, not proof of an exact MPC hardware generation. The simulator is a wired, no-auxiliary-display profile with penalty timeout enabled initially. Only timeout 0 (30 seconds/10-second warning) is configured. Ten penalty entries are a trainer limit. Wireless groups, bookmarks, full options setup, segment/auxiliary timers, hardware recovery and chronometer setup are omitted.

## Existing profiles

- Daktronics All Sport 5000 hockey overlay LL-2436: https://www.daktronics.com/en-us/support/kb/DD2754843
- All Sport 5000 manual: https://www.daktronics.com/web-documents/customer-service-manuals/ed11976.pdf
- VisionTime MN04009E Figure 1: https://cloud.rampinteractive.com/greatervictoriaminorballhockey/files/Information%20Documents/Clock%20Instructions/panorama_rinkB_clock_instructions_fullversion_april2018.pdf
- HDD 2000 manual 90-19-009, panel page 10: https://erra.ncrrl.on.ca/Resources/HDD_2000series_Manual.pdf
- Hamilton photographic cross-reference: https://nesc-timekeeping.fandom.com/wiki/HDD_2000_Series/HDD_VisionTime_Series

The existing profiles retain their earlier workflows and explicit in-app limits. Their controller-library thumbnails now use verified reference photographs (see below).

## Hamilton and Daktronics photographs

- All Sport 5000 hockey-overlay console: Mitchell Marlins volunteer training, https://www.mitchellmarlins.com/page/show/6723639-volunteer-training-and-info . Original photo https://cdn1.sportngin.com/attachments/photo/e216-164541916/timeclock_large.jpg → `dist/assets/daktronics-5000.jpg`. Checked visible hockey penalty keys rather than using a different sport overlay.
- Hamilton VisionTime: NESC Timekeeping Wiki, https://nesc-timekeeping.fandom.com/wiki/HDD_2000_Series/HDD_VisionTime_Series . Original photo https://static.wikia.nocookie.net/nesc-timekeeping/images/3/33/HDD_controller_pic.jpg/revision/latest?cb=20150628163415 → `dist/assets/hamilton-visiontime.jpg`. Verified right-hand telephone keypad, left team keys and central round controls. The separate `HDD_visiontime.jpg` is a drawing, so it is not used as the photograph.
- Hamilton 2000: Cambridge Roadrunners scoreboard/timekeeper instructions, https://cambridgeroadrunners.com/Public/Documents/2016-17_CrGHA_Scoreboard_Timekeeper_Instructions_%28Ver._2016-01-13%29.pdf . Extracted the original embedded photo from page 11 (also pictured on page 2) → `dist/assets/hamilton-2000.jpg`. Verified left calculator keypad, central functions and right HOME/GUEST columns. The combined FOULS/SHOTS position is used for hockey shots; basketball BONUS/POSSESSION remain inactive.

Photographs are retained without AI generation or alteration. Colour and housing treatments in the interactive panels are approximations based on the pictured units; installed caps and overlays can vary. Source credits appear beside the larger images inside each profile.
