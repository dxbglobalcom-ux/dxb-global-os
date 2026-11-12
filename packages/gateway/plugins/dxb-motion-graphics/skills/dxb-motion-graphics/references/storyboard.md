# The storyboard — shots that hold, and how each becomes the next

The board is where the film is directed. Changing a line on a board costs nothing; changing a built film costs a
rebuild and, after the sound is placed, the sound.

## A shot

```json
{ "n": 3, "from": 5.2, "to": 6.6, "title": "Now Playing builds",
  "hold": "The card body arrives from depth behind the album art; title, progress bar and controls land as separate layers.",
  "becomes": "The title flips through three tracks and lands on the headline — same card, no cut." }
```

- **hold** — what is on screen while the shot is itself: the subject, where it sits, what moves while it holds
  (something usually should, even a slow drift), the words and where they stand.
- **becomes** — the way out, written as a transformation someone can build: *what* turns into *what*, driven by
  *which* movement. If the line reads "then we see…", the transition has not been designed yet.
- Times overlap when one shot's exit is the next one's entrance; that is usually the sign of a good join.

`board.json`: `{ "title", "format", "total", "shots": [...], "shapeChecks": [{ "label", "ours", "reference" }], "endStill": "refs/end.png" }`.

## Ways one shot becomes the next (a vocabulary, not a menu to exhaust)

- **Shape to shape** — a circle squares into a card; a logo's bars close into a ring; a pill stretches into a bar.
  Works when both shapes share a centre and the eye can follow one outline.
- **Container** — the thing on screen turns out to be a part of a bigger thing: the icon is on a phone, the phone
  is on a desk; pull back. Or the reverse: push into a detail that becomes the next scene.
- **Carried by a move** — a whip, a roll or a fast push with real motion blur, where the blur hides the swap.
  Both shots must share the direction and speed of the move.
- **Match** — the next subject arrives in the exact position, size and angle of the last one (an AirPod on black
  becomes the AirPod in the ear).
- **Wipe by an object** — something crosses the lens and what is behind it has changed.
- **Colour or light** — the background floods to the next scene's colour from the subject outward; a light sweep
  crosses and the material has changed.
- **Flip, fold, unfold** — a card turns and its back is the next thing; a panel unfolds into a grid.
- **Assembly** — the next subject builds from parts of the last one.
- **Text hand-over** — one word stays while the rest of the line changes around it.

A plain cut is honest when the film changes subject or time on purpose. A cross-fade between two unrelated
frames is what remains when no transformation was designed; if the board has one, design the join.

## Checks before it goes for approval

- Read only the **becomes** lines top to bottom: the film should make sense as one continuous movement.
- Every shot has a reason to be there for the one action in the brief; the call to action has its own shot and
  enough time to be read.
- Words: count them. A viewer reads roughly three words a second comfortably; a line needs to be fully on screen
  for at least that long, plus its arrival.
- Each frame format: note where the subject and the words sit in 9:16 as well as 16:9.
- A physical product has its shape checks; a join into footage has its end still, measured from the footage
  (position, size, angle), not drawn from memory.
