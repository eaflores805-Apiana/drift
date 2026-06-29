# DRIFT — Scene 1 as Video Shot Prompts
### Written for a video model (Veo / Gemini), DP-style — one action per clip

**How to use:** Generate each shot as its own clip. One action per prompt — never chain events. Camera direction leads every prompt. Any phone screen or UI is a **clean plate composited in post**, never rendered by the model. Texture carries the emotion, not backstory.

**Template followed:** `[Shot / camera move] of [subject + physical texture] in [environment] under [light / atmosphere] [film / lens qualities].`

---

## CHARACTER ANCHORS (two different friends — keep them distinct across clips)

- **Traveler (Pittsburgh):** late 20s, dark hair in a messy low bun with loose damp strands, heavy shadows under the eyes, chunky gray sweater and scarf.
- **Student (California):** early 20s, lighter hair in a loose bun, over-ear headphones, plain white tee, relaxed.

---

## COLD BLOCK — Pittsburgh

**Shot 1 — Landed, and empty**
> Slow push-in shot of a young woman with a messy dark bun, damp loose strands across her forehead and heavy shadows under her eyes, resting her head against a rain-streaked airplane window, in a dim aircraft cabin at dusk, under cold blue-gray light with blurred runway lights and wet tarmac reflections beyond the glass, shallow depth of field, anamorphic 35mm film look, fine grain.

*Action: just the breath and the rain. Nothing happens but exhaustion.*

**Shot 2 — The cold glow** *(phone composited in post)*
> Static extreme close-up of the same tired woman's face tilted slightly downward, lit from below by a cold blue glow, stray damp hair catching the light, in a dark airplane cabin, under harsh low-key blue light, shallow depth of field, anamorphic, 35mm film grain.

*Action: the cold light flickers on her face; she lowers her gaze. Composite the phone + screen in post — do not have the model render typing.*

---

## WARM BLOCK — California

**Shot 3 — Her afternoon**
> Slow push-in shot of a relaxed young woman in over-ear headphones, hair in a loose bun, writing in a notebook, in a sun-drenched bedroom with polaroid photos pinned to the wall and potted plants on the sill, under warm golden-hour light with dust motes drifting in the air, shallow depth of field, anamorphic, 35mm film look.

*Action: she writes, easy and in flow. Camera settles toward her.*

**Shot 4 — Something lands**
> Medium close-up, subtle slow push-in, of the young woman pausing mid-writing, her pen going still and her gaze lifting to drift off-camera, in the warm sunlit bedroom, under soft golden light with floating dust motes, shallow depth of field, anamorphic, gentle 35mm grain.

*Action: one beat only — the pause and the look up.*

**Shot 5 — She made it** *(HERO — push hardest here)*
> Static extreme close-up of a slow warm smile spreading across the young woman's face, her eyes softening, in a sunlit room, under golden backlight catching loose strands of hair, shallow depth of field, creamy bokeh, anamorphic, 35mm film look.

*Action: recognition, not serenity — the smile should arrive like she just heard something, not like she's daydreaming.*

**Insert (optional, the connective thread) — the photo**
> Macro static shot of a single polaroid of two smiling friends pinned to a sunlit bedroom wall, edges curling slightly, in warm afternoon light with soft dust motes, shallow depth of field, 35mm film look.

*Cut here on her glance in Shot 5. This is how the connection reads with zero UI — her smile now has an object, and the viewer understands it's about a person without a word said.*

**Shot 6 — Back into her day**
> Slow pull-back shot of the young woman lowering her gaze to her notebook and resuming writing, a faint smile lingering, in the warm sunlit bedroom, under golden afternoon light, shallow depth of field, anamorphic, 35mm film grain.

*Action: she looks back down and writes. Note the camera move is a pull-BACK here (Shot 3 pushed in), so this plays as a different beat, not a repeat.*

---

## NOTES FOR THE EDIT
- The DJ voiceover does the explaining; these plates do the feeling. Keep them clean.
- Order: 1 → 2 → (hard cut) → 3 → 4 → 5 → photo insert → 6.
- If you keep the polaroid insert, the scene tells its own story even on mute. If you drop it, the VO has to carry the connection alone — worth deciding before you spend generations.
