import { abilityGrowth } from "@core/ability/improve";
import { useI18n } from "../../i18n";

/**
 * "How to strengthen this" section for a cognition result. Evidence-honest:
 * task strategies + brain-health basics, with a standing caveat about limited
 * transfer (see core/ability/improve.ts). Localized via the active locale.
 */
export function CognitionGrowth({ testId }: { testId: string }) {
  const { locale } = useI18n();
  const g = abilityGrowth(testId, locale);
  return (
    <section className="panel sec">
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, marginTop: 0 }}>{g.headline}</h3>
      <ul className="caveats">
        {g.tips.map((t, i) => (
          <li key={i}>
            <b>{t.title}.</b> {t.detail}
          </li>
        ))}
      </ul>
      <p className="note" style={{ margin: "12px 0 0" }}>{g.caveat}</p>
    </section>
  );
}
