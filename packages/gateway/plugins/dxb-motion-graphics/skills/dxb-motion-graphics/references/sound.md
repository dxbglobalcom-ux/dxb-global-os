# Sound — placed after the picture is locked, measured because it cannot be heard

The one who builds the film cannot hear it. So sound here is designed by rule, placed by measurement and judged,
at the end, by a person. Say so in the hand-over.

## Order

Picture first, locked; then effects; then voice; then levels. A picture change after that moves every cue.

## Effects

- An effect belongs where something **moves or changes**: a whoosh under a move (its length about the move's
  length), a pop, tick or click where a shape lands or a morph completes, a soft impact for a heavy arrival, a
  riser into a reveal, a shimmer on a logo resolving, a low drop under an end card. Silence between them is part
  of the design; a sound on everything is noise.
- **Each cue says which point of the sound sits on the event.** A whoosh usually peaks in its middle or late: its
  **peak** goes on the moment of fastest movement, or its **end** on the landing. A pop or tick is all attack:
  its **start** goes on the frame the shape lands. A riser's **end** goes on the reveal.
- `sound/cues.json`: `{ "event": "cardLands", "file": "sound/pop-soft-02.wav", "align": "start", "db": -18 }`.
  Events are the names in the page's `FILM.EVENTS` — add an event to the page for every moment that deserves a
  sound, and the cue follows the picture if a time changes before the lock.
- Levels are set in two moves. First the balance between the cues: whooshes and beds lowest, pops and ticks a
  few dB above them, one or two accents a few dB above those. Then the whole set is moved together until the
  rendered film measures at the delivery's target — a film that carries only effects is mostly silence, so each
  cue sits far higher than its figure in a full mix would (measured on the first film, 2026-11-12: cues at −26
  to −32 dB gave −41.5 LUFS; raised to between −9 and −20 dB the same film measured −31.6 LUFS). Never clipping;
  leave the peaks a couple of dB under full scale.
- Vary: the same pop three times in a row is heard as a machine. Use neighbours from the same family.
- Sources, in order: the job owner's own licensed files → the starter set in `sfx/` (see `sfx/INDEX.md` for each
  file's length, peak position and character, and `sfx/LICENCES.md`) → generated basics (`sfx/synth.mjs`) → a paid
  library as a priced proposal to the one who decides purchases.

## Voice

- Written **to the shots**: read the beat times, give each line a start time, and count words — about 2.2 words a
  second is a comfortable advertising pace, slower for weight. If the end card should stand without a voice over
  it, end the last line before it arrives.
- A line should end before the shot that carries it changes. Write the timed script first
  (`0.2s  Got AI skills?`), have it approved with the board when the voice carries the message.
- Spoken by the studio's own voice tool; the file's real length is measured and the script adjusted, never the
  picture, once the picture is locked.
- Voice sits above everything else; effects duck under it where they overlap.

## Music

This skill adds none. The holding's own work carries no music. For a client's film, follow the ruling given for
client work; if the job's brief says nothing, ask the one who ordered it before the board is approved, and build
the film so it stands on its picture, effects and voice.

## Levels and measurement

- The loudness target is the delivery's (the platform's or the client's). When the brief gives none, say which
  figure was used and why.
- `mg sound` writes the clips; `mg verify` measures, on the rendered film's decoded audio, where each cue's
  aligned point actually landed (within one frame) and the film's integrated loudness.
- What stays unverified until a person listens: whether the effects suit the brand, whether anything is harsh or
  muddy, whether the voice sounds natural. List it; do not claim it.
