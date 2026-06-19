import { type ModelDerived, ModelDerivedSchema } from "./types";

/**
 * Parse-and-validate a raw model response against `ModelDerivedSchema`.
 *
 * Two failure modes, distinguished so the retry layer can build a repair
 * message that names what actually went wrong:
 *
 *  - `kind: "parse"`  — the response wasn't valid JSON.
 *  - `kind: "schema"` — JSON was valid but didn't match `ModelDerivedSchema`.
 *
 * Per team ruling 2026-06-19, the retry layer gets ONE repair attempt for
 * either failure. If the retry also fails, the caller throws and caches
 * nothing.
 */

export type ParseResult =
  | { ok: true; data: ModelDerived }
  | { ok: false; kind: "parse"; error: string; raw: string }
  | { ok: false; kind: "schema"; error: string; raw: string };

export function parseAndValidate(raw: string): ParseResult {
  // Defensive: strip common code-fence wrappers the model sometimes adds
  // despite the prompt's "no markdown" instruction. Cheap and harmless.
  const cleaned = stripFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return {
      ok: false,
      kind: "parse",
      error: e instanceof Error ? e.message : String(e),
      raw,
    };
  }

  const validated = ModelDerivedSchema.safeParse(parsed);
  if (!validated.success) {
    return {
      ok: false,
      kind: "schema",
      error: validated.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; "),
      raw,
    };
  }

  return { ok: true, data: validated.data };
}

function stripFences(s: string): string {
  const trimmed = s.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
  }
  return trimmed;
}
