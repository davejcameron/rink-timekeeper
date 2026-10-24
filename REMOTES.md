# Remote-control practice

Checked 2026-10-24. Remote compatibility depends on the exact console, port assignments and firmware. The accessory drawer models documented training configurations, not every wiring option or wireless pairing process. Handheld drawings are schematic; linked manufacturer photos are identified separately. Practice starts with accessories disconnected. Connecting requires a stopped game clock; disconnecting stops it in this trainer.

| Console profile | Playable accessories | Important behavior |
| --- | --- | --- |
| Daktronics All Sport 5000 | J4 start/stop/horn | Maintained clock rocker; held horn. Console keys remain available. J7 shot-clock accessory is outside this game-clock profile. |
| Nevco MPC code 871 | TCS-5 | Console TIME ON/OFF locked until unplugged and restarted. Four-second remote horn limit. |
| Nevco MPC-4 K2-28 | TCS-1 | Alternate console time switch inactive while connected. Only the documented clock switch is shown. |
| Nevco MPCW-7 | TCS-7 | Console TIME ON/OFF locked until unplugged and restarted. Four-second remote horn limit. |
| OES ISC9000 | ISCREM-S game/horn, ISCREM-P shots, ISC-HH GAME and SOG modes | Fixed port/mode assignments; pairing assumed complete. GAME resets time and score; SOG changes shots. Wireless button positions are functional, not an exact physical replica. |
| Hamilton VisionTime PR04200/PR04203 | External run/hold toggle; auxiliary shots box | External timer input is momentary. Shots box uses DOWN to subtract and all three held to reset. No external horn is assumed. |
| Fair-Play MP-70/72 | HH-70 clock/horn; HC-70 clock/reset; compatible MiClock MC-10 | Not MP-50 accessories. Both wired switches must be off to reset. MiClock requires MP-72-2211/-2213 firmware2.25+ and SHIFT1 YES exclusive mode. |

The Fair-Play wired-switch model treats either maintained ON input as keeping time running, based on the manual's requirement to place console TIME IN at TIME OUT for handheld operation and both switches OFF for reset. This is an implementation inference from the documented operating procedure, not a manufacturer description of the circuit.

Unimplemented/unverified: HDD2000 external time switch (exact model mapping unresolved), ISC85X external play-timer reset (optional play timer omitted), Scoretec U1000 (documented local configuration has no remote), and photographed Harris/Rotomatic configurations (no verified remote). The legacy Hamilton PR99176A shots box is documented for PR99178A only; it is not presumed installed across the HDD2000 family.

## Primary references

- Daktronics ED11976, remote start/stop controls: https://www.daktronics.com/web-documents/customer-service-manuals/ed11976.pdf
- Nevco 135-0066, TCS-5 and alternate-time keys: https://erra.ncrrl.on.ca/Resources/Nevco_871_Full.pdf
- Nevco MPC-4 K2-28: https://www.hockeycalgary.ca/assets/file/Nevco008-3261.pdf
- Nevco MPCW-7 135-0222RC: https://nevcodocs.s3.amazonaws.com/Controls/MPC-7/Hockey.PDF
- OES ISC9000 J12, remote input ports and Configuration6: https://cloud.rampinteractive.com/burlingtonringette/files/Arena_instructions/ISC9000-UserManual_J12_1.3.pdf
- OES ISCREM-S product/photo: https://www.oes-scoreboards.com/product/controller-iscrem-s/
- OES ISC-HH product: https://www.oes-scoreboards.com/product/controller-isc-hh/
- Hamilton2007 PR04200/PR04203 sections2.4/3.7: https://cloud.rampinteractive.com/greatervictoriaminorballhockey/files/Information%20Documents/Clock%20Instructions/panorama_rinkB_clock_instructions_fullversion_april2018.pdf
- Fair-Play 98-0002-29, printed pages11/14: https://www.fair-play.com/wp-content/uploads/2023/03/98-0002-29MP-50_MP-70.pdf
- HH-70 official photo: https://www.fair-play.com/wp-content/uploads/2020/03/HH-70-fp.jpg
- HC-70 official photo: https://www.fair-play.com/wp-content/uploads/2020/03/HC-70-fp.jpg
