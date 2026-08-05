import type { useTranslations } from "next-intl";

type Translator = ReturnType<typeof useTranslations>;

type Identifiable = { id?: string; key?: string };

/** The id a content item is keyed by in the message files. */
function idOf(item: Identifiable, index: number): string {
  return item.id ?? item.key ?? String(index);
}

/**
 * Overlays translated copy onto a content array.
 *
 * The shape of the content stays in `content/*.ts`: ids, images, numbers,
 * colours, ordering. The words live in `messages/<locale>.json`, keyed by the
 * item's own id, so the two can never drift apart on ordering and a
 * translator never has to open a `.ts` file.
 *
 * `t.raw` rather than `t` because this copy carries no placeholders that would
 * need formatting, and raw keeps the message file readable.
 *
 * Fields that hold a list of strings are not handled here: read those with
 * `listCopy`, which says in the call site that a list is coming back.
 */
export function withCopy<T extends Identifiable, K extends string>(
  t: Translator,
  items: readonly T[],
  fields: readonly K[],
): (T & Record<K, string>)[] {
  return items.map((item, index) => {
    const id = idOf(item, index);
    const translated: Record<string, unknown> = { ...item };
    for (const field of fields) {
      translated[field] = t.raw(`${id}.${field}`);
    }
    return translated as T & Record<K, string>;
  });
}

/** A translated list of strings, for the copy fields that hold one. */
export function listCopy(t: Translator, key: string): string[] {
  return t.raw(key) as string[];
}
