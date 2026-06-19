/**
 * Novelty by novelty_key dedup within a configurable window (hours).
 * First time a key is seen in the window → novel (true); subsequent
 * sightings within the window → not novel (false).
 *
 * Per BUILD.md hard check #3: repeated or related items must not
 * blindly keep earning the same attention.
 */
export class NoveltyTracker {
  private seen = new Map<string, number>(); // novelty_key -> last-seen timestampMs

  constructor(private windowHours: number) {}

  isNovel(novelty_key: string, timestampMs: number): boolean {
    const prev = this.seen.get(novelty_key);
    this.seen.set(novelty_key, timestampMs);
    if (prev === undefined) return true;
    const hours = (timestampMs - prev) / 3.6e6;
    return hours > this.windowHours;
  }
}
