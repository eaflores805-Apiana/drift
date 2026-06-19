import { z } from "zod";
import {
  type IngestedItem,
  IngestedItemSchema,
  type Listener,
  ListenerSchema,
} from "./schemas";

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function validateListener(raw: unknown): ValidationResult<Listener> {
  const result = ListenerSchema.safeParse(raw);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: formatZodError(result.error) };
}

export function validateItem(raw: unknown): ValidationResult<IngestedItem> {
  const result = IngestedItemSchema.safeParse(raw);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: formatZodError(result.error) };
}

function formatZodError(err: z.ZodError): string {
  return err.issues
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}
