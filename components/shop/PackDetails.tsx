"use client";
import {useLocale, useTranslations} from 'next-intl';
import {packContents, type TierPack} from '@/lib/shop/pack-tiers';
import styles from './PackDetails.module.css';

export default function PackDetails({pack}:{pack:TierPack}) {
  const t=useTranslations('shop.packTiers'), locale=useLocale();
  const contents=packContents(pack);
  const percent=new Intl.NumberFormat(locale,{style:'percent',maximumFractionDigits:1});
  return <div className={styles.details}>
    <p>{t('always',{cards:contents.guaranteed.map(card=>`${card.count} ${t(`rarities.${card.rarity}`)}`).join(' · ')})}</p>
    {contents.random.map(slot=><div key={slot.slot}>
      <strong>{slot.slot===4 ? t('fifthCard') : t('card',{number:slot.slot+1})}</strong>
      <dl className={styles.odds}>{slot.odds.map(odd=><div key={odd.rarity}>
        <dt>{t(`rarities.${odd.rarity}`)}</dt><dd>{percent.format(odd.percent/100)}</dd>
      </div>)}</dl>
    </div>)}
  </div>;
}
