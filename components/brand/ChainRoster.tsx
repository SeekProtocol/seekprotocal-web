import { CHAINS, COIN_CHAINS } from "@/content/chains";
import { AnyChainMark, ChainMark } from "@/components/brand/ChainMarks";
import ChainCoinsMount from "@/components/brand/ChainCoinsMount";

/**
 * The settlement chains, as a strip.
 *
 * Reads `content/chains.ts` rather than a list written into the copy, so a
 * network that goes live moves here, on the business page and in the whitepaper
 * from one edit. The status word is the only translated string, because the
 * network names are proper nouns in every locale.
 *
 * `note` is the line under the strip. It is passed in rather than fetched here
 * because each surface says something different with the same set of chains:
 * the homepage says what it means for a seeker, the business page says what it
 * means for a campaign.
 */
export default function ChainRoster({
  anyLabel,
  note,
  coinsLabel,
}: {
  /** The open-ended tile that closes the strip. */
  anyLabel: string;
  note?: string;
  /**
   * Alt text for the coin row. Passing it is what turns the row on, so a
   * surface that only wants the flat strip simply leaves it out.
   */
  coinsLabel?: string;
}) {
  return (
    <div className="chain-roster">
      {coinsLabel && COIN_CHAINS.length > 0 ? <ChainCoinsMount label={coinsLabel} /> : null}
      <ul className="chain-strip">
        {CHAINS.map((chain) => (
          <li key={chain.id} className="chain-tile">
            <span className="chain-tile-mark">
              <ChainMark id={chain.id} name={chain.name} />
            </span>
            <span className="chain-tile-name">{chain.name}</span>
          </li>
        ))}

        {/* The strip has to end open. Four named tiles with a live-or-next
            badge on each read as the full list of what works, which is the
            opposite of the claim above them: the protocol is not waiting on
            an integration per chain, it is waiting on a row in a table.
            Which chains settle today is a fact and it is still stated, in the
            note underneath, where it belongs. */}
        <li className="chain-tile chain-tile-any">
          <span className="chain-tile-mark">
            <AnyChainMark />
          </span>
          <span className="chain-tile-name">{anyLabel}</span>
        </li>
      </ul>
      {note ? <p className="t-small chain-roster-note">{note}</p> : null}
    </div>
  );
}
