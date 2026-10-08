import Image from "next/image";
import { useTranslations } from "next-intl";
import { listCopy } from "@/lib/content-i18n";
import { RARITY_LADDER } from "@/content/collectibles";
import { STOCK_LINKS, STOCK_TOKENS } from "@/content/stocks";

/**
 * Tokenized stocks on the map.
 *
 * The cards reuse the collectible card on purpose: in the app these are coins
 * like any other, spawned and caught the same way, and drawing them as a
 * different kind of object would suggest a different kind of product.
 *
 * The fine print is not optional decoration. These are securities with
 * jurisdiction rules set by the issuer, and the section that advertises them
 * is the place a reader has to meet those rules, not a page they might click.
 */
export default function StocksSection() {
  const t = useTranslations("stocksSection");
  const rarity = useTranslations("rarity");

  return (
    <div className="stocks" id="stock-tokens">
      <div className="stocks-layout">
        <div className="sec-head reveal">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h2 className="t-h2">{t("title")}</h2>
          <p className="t-lead" style={{ marginTop: "1.25rem" }}>
            {t("lead")}
          </p>
          <ul className="showcase-points">
            {listCopy(t, "points").map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="stocks-grid">
          {STOCK_TOKENS.map((coin) => (
            <article
              key={coin.key}
              className="collectible reveal"
              style={{ ["--rarity" as string]: RARITY_LADDER[coin.rarity].colour }}
            >
              <div className="collectible-art">
                <span className="collectible-glow" aria-hidden="true" />
                <Image src={coin.image} alt={t("coinAlt", { name: coin.name })} width={104} height={107} />
              </div>
              <span className="collectible-rarity">{rarity(coin.rarity)}</span>
              <h3 className="collectible-name">{coin.name}</h3>
              <p className="collectible-symbol t-mono-sm">{coin.ticker}</p>

              <dl className="collectible-stats stocks-stats">
                <div>
                  <dt>{t("catchChance")}</dt>
                  <dd>{Math.round(coin.base * 100)}%</dd>
                </div>
                <div>
                  <dt>{t("perCatch")}</dt>
                  <dd>${coin.value.toFixed(2)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>

      <div className="stocks-fine reveal">
        <p>{t("finePrint")}</p>
        <ul className="stocks-links">
          {(["restrictions", "terms", "faq"] as const).map((key) => (
            <li key={key}>
              <a href={STOCK_LINKS[key]} target="_blank" rel="noopener noreferrer">
                {t(`links.${key}`)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
