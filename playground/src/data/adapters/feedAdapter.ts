import { readFileSync } from "node:fs";
import {
  type IngestedItem,
  IngestedItemSchema,
  type SourceType,
} from "../schemas";

/**
 * feedAdapter — turns a world-sim feed (`scripts/post-writer.ts` output) into
 * the `IngestedItem[]` the brain consumes. This is Connection Point 1 for the
 * synthetic-world track: the feed is the PUBLIC surface Drift would actually
 * see. It carries NO hidden context — the answer key and hidden arcs live
 * git-ignored under `runs/` and are never read here (firewall).
 *
 * The brain must see exactly what a listener's feed shows and nothing more, so
 * this adapter reads only `feed-*.json` (public posts).
 */

export interface FeedPost {
  id: string;
  author_id: string;
  author_name: string;
  account_type: string; // "person" | "local_business" | "civic" | "brand" | "creator"
  day: number;
  date: string; // ISO timestamp
  surface: string; // "feed" (all public in v2)
  text: string;
  reply_to: string | null;
}

export interface FeedFile {
  world_tag: string;
  listener: string;
  posts: FeedPost[];
}

/**
 * Person-level source_type overrides keyed by author_id. The cast
 * (`world-bible/cast.public.json`) defines each person's relationship to the
 * listener; family/coworker change the focus weight and downstream register,
 * so we map them explicitly rather than collapsing every person to "friend".
 */
const PERSON_SOURCE_TYPE: Record<string, SourceType> = {
  dana: "family", // younger sister
  uncle_ray: "family", // uncle
  jess: "family", // distant cousin (also a coworker; family is the closer tie)
  sam: "coworker", // coworker at the design studio
};

/** civic accounts split: a news desk is "news"; a school athletics program is a local org. */
const CIVIC_SOURCE_TYPE: Record<string, SourceType> = {
  ventura_news: "news",
};

function sourceTypeFor(post: FeedPost): SourceType {
  switch (post.account_type) {
    case "person":
      return PERSON_SOURCE_TYPE[post.author_id] ?? "friend";
    case "local_business":
      return "local_org";
    case "civic":
      return CIVIC_SOURCE_TYPE[post.author_id] ?? "local_org";
    case "brand":
      return "brand";
    case "creator":
      return "creator";
    default:
      // unknown account types enter as a low-focus local org rather than crash
      return "local_org";
  }
}

/** Patagonia is the only national brand in the cast; everyone else is in town. */
function locationFor(post: FeedPost): string | null {
  return post.author_id === "patagonia" ? null : "Ventura, CA";
}

/**
 * Novelty key: content-based so an identical repost within the window dedups,
 * but distinct life-moments stay novel. Normalize whitespace + case, cap length.
 */
function noveltyKeyFor(post: FeedPost): string {
  const norm = post.text.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 100);
  return `${post.author_id}::${norm}`;
}

export function feedPostToItem(post: FeedPost): IngestedItem {
  const item: IngestedItem = {
    id: post.id,
    source_type: sourceTypeFor(post),
    source_name: post.author_name,
    account_id: post.author_id, // closeness() keys on this against listener.closeness_map
    // every v2 post is on the public "feed" surface → eligible at the consent gate.
    audience_scope: post.surface === "feed" ? "public" : post.surface,
    timestamp: post.date,
    expires_at: null,
    raw_text: post.text,
    entities: [],
    location: locationFor(post),
    novelty_key: noveltyKeyFor(post),
  };
  // Validate against the contract so a feed-shape drift fails loudly here, not
  // three stages downstream.
  return IngestedItemSchema.parse(item);
}

export function loadFeedItems(feedPath: string): {
  items: IngestedItem[];
  world_tag: string;
  listener_id: string;
} {
  const file = JSON.parse(readFileSync(feedPath, "utf-8")) as FeedFile;
  return {
    items: file.posts.map(feedPostToItem),
    world_tag: file.world_tag,
    listener_id: file.listener,
  };
}
