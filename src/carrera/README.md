# CarreraStory — "La Carrera"

The same sum on paper and in the app, racing from frame 0, so the product is on
screen before anyone can scroll past. The top half is the libreta, worked by
hand; the bottom half is a real recording. A commentator calls it, and the band
between them marks who got there first. It shows no times: the paper is staged,
so a clock would read as a measured claim.

- **The app plays at 1×.** `app.trimBefore` starts it and nothing retimes it,
  because the video says "app a velocidad real". The card may pan between
  `app.from` and `app.to`, but never cut or speed up the footage.
- **Hold after the finish.** Takes move on to the next product, so
  `app.holdStill` is a frame exported after the result lands, shown from
  `app.holdAt`. Without it the app appears to keep working once it has "won".
- **The paper half is staged.** `disclaimer` is always on screen and must say
  so. Claim the result, not a time: no "X veces más rápido".
- Say "ya tiene el total", not "ya cobró", unless the take really charges.
- Commentator takes use `--brand punto-listo-carrera`.

## New episode

1. Copy `src/videos/carrera-kilo.props.ts`.
2. Find one continuous stretch of a take, and read `finish.app` off it: the
   moment the result lands, minus `app.trimBefore`.
3. Time `paper.lines` so the page ends after the app does.
4. Register a `<Composition>` in the `carrera` folder of `src/Root.tsx`.
