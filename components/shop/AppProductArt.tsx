import Image from "next/image";
import type { ShopProduct } from "@/lib/shop/catalog";
import styles from "./AppProductArt.module.css";

// Illustrated booster identities follow seekar-app/lib/powerups/models.ts.
const BOOST_MODELS: Record<string, string> = {
  rare_boost: "shiba", spawn_lure: "whale", xp_boost: "to_the_moon",
  coin_magnet: "coin_magnet", to_the_moon: "to_the_moon", pump_it: "pump_it",
  diamond_hands: "diamond_hands", cash: "cash", fitness: "fitness",
  shiba: "shiba", whale: "whale", chill_guy: "chill_guy", this_is_fine: "this_is_fine",
};

export default function AppProductArt({ product }: { product: ShopProduct }) {
  const pass = product.kind === "pass";
  const models = [...new Set(product.grants.map(grant => BOOST_MODELS[grant.powerupKey]).filter(Boolean))];
  if (!pass && models.length === 0) return null;

  // Only use the combined artwork when all three pictured boosts are included.
  const boostBundle = product.kind === "bundle" && models.length === 3
    && ["shiba", "coin_magnet", "to_the_moon"].every(model => models.includes(model));
  if (boostBundle) return <div className={styles.frame} data-app-art="bundle" aria-hidden="true">
    <Image className={styles.boost} src="/app/shop/powerups/icons/boost-bundle.webp"
      alt="" width={768} height={768} sizes="(max-width: 620px) 118px, 148px" />
  </div>;

  if (product.kind === "bundle") return <div className={`${styles.frame} ${styles.bundle}`} data-app-art="bundle" aria-hidden="true">
    {models.map(model => <Image key={model} className={styles.bundleItem}
      src={`/app/shop/powerups/icons/${model}.webp`} alt="" width={768} height={768} sizes="112px" />)}
  </div>;

  return <div className={styles.frame} data-app-art={pass ? "pass" : models[0]} aria-hidden="true">
    <Image
      className={pass ? styles.pass : styles.boost}
      src={pass ? "/app/shop/season-pass.svg" : `/app/shop/powerups/icons/${models[0]}.webp`}
      alt=""
      width={pass ? 320 : 768}
      height={pass ? 208 : 768}
      sizes={pass ? "(max-width: 620px) 160px, 240px" : "(max-width: 620px) 118px, 148px"}
    />
  </div>;
}
