/**
 * Translated blog copy, per locale: one import per content/blog/<locale>.json.
 * en.json is the translators' source and is not listed (English comes from
 * lib/blog-data.ts). Add a locale here when its file is added.
 */
import type { BlogCopy } from "@/lib/blog-data";
import ar from "./ar.json";
import de from "./de.json";
import el from "./el.json";
import es from "./es.json";
import et from "./et.json";
import fa from "./fa.json";
import fi from "./fi.json";
import fr from "./fr.json";
import hr from "./hr.json";
import hu from "./hu.json";
import id from "./id.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import ms from "./ms.json";
import nl from "./nl.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ru from "./ru.json";
import sl from "./sl.json";
import sq from "./sq.json";
import sr_Cyrl from "./sr-Cyrl.json";
import sr_Latn from "./sr-Latn.json";
import sv from "./sv.json";
import th from "./th.json";
import tr from "./tr.json";
import uk from "./uk.json";
import vi from "./vi.json";
import zh from "./zh.json";
import zh_TW from "./zh-TW.json";

export const BLOG_TRANSLATIONS: Record<string, Record<string, BlogCopy>> = {
  "ar": ar,
  "de": de,
  "el": el,
  "es": es,
  "et": et,
  "fa": fa,
  "fi": fi,
  "fr": fr,
  "hr": hr,
  "hu": hu,
  "id": id,
  "it": it,
  "ja": ja,
  "ko": ko,
  "ms": ms,
  "nl": nl,
  "pl": pl,
  "pt": pt,
  "ru": ru,
  "sl": sl,
  "sq": sq,
  "sr-Cyrl": sr_Cyrl,
  "sr-Latn": sr_Latn,
  "sv": sv,
  "th": th,
  "tr": tr,
  "uk": uk,
  "vi": vi,
  "zh": zh,
  "zh-TW": zh_TW,
};
