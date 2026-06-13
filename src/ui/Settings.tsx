import { useState } from "react";
import type { Profile } from "../profile";
import { LanguageSwitcher, useI18n } from "../i18n";
import { ThemeToggle } from "./theme";

/**
 * "Your space" — a small settings sheet for the things a person owns: their
 * name, appearance, language, and the nuclear option to wipe everything. No
 * account, all local; this just makes those controls reachable from anywhere.
 */
export function Settings({
  profile,
  onSaveName,
  onReset,
  onClose,
}: {
  profile: Profile;
  onSaveName: (name: string) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const [name, setName] = useState(profile.name === "Friend" ? "" : profile.name);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    onSaveName(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet view-enter" role="dialog" aria-label={t("set.title")} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>{t("set.title")}</h2>
          <button className="coach-close" onClick={onClose} aria-label={t("home.cancel")}>✕</button>
        </div>

        <div className="sheet-body">
          <label className="set-label">{t("set.name")}</label>
          <div className="row-actions" style={{ justifyContent: "flex-start", gap: 8 }}>
            <input
              className="name-input set-name"
              value={name}
              maxLength={40}
              placeholder={t("intro.namePlaceholder")}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            />
            <button className="btn sm" onClick={save}>{saved ? "✓" : t("set.save")}</button>
          </div>

          <div className="set-row">
            <span className="set-label">{t("set.appearance")}</span>
            <ThemeToggle locale={locale} />
          </div>
          <div className="set-row">
            <span className="set-label">{t("set.language")}</span>
            <LanguageSwitcher />
          </div>

          <div className="set-danger">
            <span className="set-label">{t("set.danger")}</span>
            {confirmReset ? (
              <div className="row-actions" style={{ justifyContent: "flex-start" }}>
                <button className="btn sm" onClick={onReset} style={{ background: "var(--danger)" }}>{t("set.resetConfirm")}</button>
                <button className="btn sm ghost" onClick={() => setConfirmReset(false)}>{t("home.cancel")}</button>
              </div>
            ) : (
              <button className="btn sm ghost" onClick={() => setConfirmReset(true)}>{t("set.reset")}</button>
            )}
          </div>

          <p className="trust" style={{ marginTop: 4 }}>{t("set.privacy")}</p>
        </div>
      </div>
    </div>
  );
}
