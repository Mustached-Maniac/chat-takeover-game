# List of things and stuff
Brain dump for ideas/items needing to be tidied up.

---

## Streamer.bot Related
 - [x] Add test commands to fire off simulated events
 - [x] Integrate GPT responses
    - [x] Ensure tags are included with each response
 - [x] Pass tags through WS to trigger actions
 - [ ] Update/store global list for "ownership" after every turn
 - [ ] Add logic to determine percentage controlled by team (both population and sq miles)
    - [ ] store as temp globals to be used for commands, etc.
 - [ ] Add on-screen polling (2-5 options) *will require move source in OBS*
    - [ ] pass poll result as teamChat prompt
 - [ ] Add Set-Up Action
    - [ ] Store API key if don't already have one
    - [ ] Set streamer/chat team colors
    - [ ] Set streamer/chat starting states
    - [ ] Toggle for TTS (would require a global bool to check in main action)
 - [ ] Store win/loss record for Broadcaster and each user who played (participated in at least X polls)
    - [ ] Requires creating a group / adding players once voteCount > X
 - [ ] Keep track of how many times each user voter for end of game credits?
 - [ ] M.U.L.T.I. P.L.A.T.F.O.R.M. S.U.P.P.O.R.T.
    - [ ] Case statements to send "narrative" to correct chat based on how received
 
 ### Commands
 - [ ] Initialization
 - [ ] Start Game
 - [ ] Make Move (streamer / chat separate)
 - [ ] Current "ownership" percentages
 - [ ] User win/loss ratio
 - [ ] "End Now" - determines the winner based on current "ownership" levels (special prompt required)
 - [ ] Reset Map (maybe include with End Now?)

---

## JS Related
 - [x] States change colors based on team "ownership"
 - [x] startPlace centered left half of screen, endPlace on right
 - [x] Smooth easing in/out of position
 - [x] Blur background during showcase
 - [x] Handle incoming websocket payloads from SB
    - [ ] Receive/check dictionary for ownership logic?
 - [ ] Add rumble for endPlace
 - [ ] Add animated arrow (*maybe* cannonballs, bullets, etc?) from startPlace to endPlace <use another container?>
 - [ ] Add sound effects
    - [ ] Background music?
    - [ ] Attack sounds (preferably 20+ to randomly select)
    - [ ] Success sounds (multiple variants?)
    - [ ] Failure sounds (multiple variants?)
 - [ ] Potential "intro video" / splash screen to start
 - [ ] WINNER animation, sounds, etc

---

## Random / Admin / Nice to Haves
 - [ ] Move prompt_instructions into 'Assets' once it's ironed out
    - [ ] Incorporate "winning" logic/explanation as part of default instructions
 - [ ] Ensure README has thorough instructions
 - [ ] Create post for SB Extension Site
 - [ ] Find testers (maybe add text log to consolidate their results/data)
 - [ ] Remote version checking?
 - [ ] Narrative on screen (via OBS or JS)?
 - [ ] Script YT Video(s)
    - [ ] Long-form demonstration
    - [ ] How-To Install/Use