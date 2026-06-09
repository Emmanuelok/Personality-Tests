import { abilityGrowth } from "@core/ability/improve";
import { PRODUCTS, formatPrice } from "@core/commerce";
import { useI18n } from "../../i18n";

const COG = PRODUCTS.find((p) => p.id === "cognitive");

/**
 * "How to strengthen this" report for a cognition result — the paid extra. The score
 * and interpretation stay free on the result screen; this evidence-based plan (task
 * strategies, brain-health basics, and the honest limited-transfer caveat) sits behind
 * the Full Cognitive Report. Localized via the active locale.
 */
export function CognitionGrowth({
  testId,
  unlocked,
  onPurchase,
  busy,
}: {
  testId: string;
  unlocked: boolean;
  onPurchase: () => void;
  busy?: boolean;
}) {
  const { locale } = useI18n();
  const g = abilityGrowth(testId, locale);
  const price = COG ? formatPrice(COG.priceCents, COG.currency) : "$1.89";

  return (
    <section className="panel sec">
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{g.headline}</h3>
      {unlocked ? (
        <>
          <ul className="caveats">
            {g.tips.map((t, i) => (
              <li key={i}>
                <b>{t.title}.</b> {t.detail}
              </li>
            ))}
          </ul>
          <p className="note" style={{ margin: "12px 0 0" }}>{g.caveat}</p>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <p style={{ color: "var(--text-dim)", maxWidth: 520, margin: "0 auto 16px" }}>{g.teaser}</p>
          <button className="btn" disabled={busy} onClick={onPurchase}>
            {busy ? "…" : `${g.unlockCta} — ${price}`}
          </button>
          <p className="trust" style={{ marginTop: 12 }}>{g.unlockTrust}</p>
        </div>
      )}
    </section>
  );
}
