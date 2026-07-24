import {
  exactKeys,
  objectValue,
  stringArray,
  stringValue,
  type JsonObject,
  ValidationError,
} from "./_validation";

const SAFE_TEXT = /^[^\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]*$/u;
const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export interface AskRequest {
  question: string;
  locale: SupportedLocale;
  consent: { externalAI: true };
  actionableEvidence: string[];
}

function safeText(value: unknown, field: string, maximumLength: number): string {
  return stringValue(value, field, {
    min: 1,
    max: maximumLength,
    pattern: SAFE_TEXT,
  });
}

export function parseAskRequest(body: JsonObject): AskRequest {
  exactKeys(
    body,
    ["question", "locale", "consent", "actionableEvidence"],
    ["question", "locale", "consent", "actionableEvidence"],
  );
  const question = safeText(body.question, "question", 1_000);
  const locale = stringValue(body.locale, "locale", {
    min: 2,
    max: 2,
    pattern: /^(?:en|es|fr)$/,
  }) as SupportedLocale;
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    throw new ValidationError("unsupported_locale", "locale");
  }

  const rawConsent = objectValue(body.consent, "consent");
  exactKeys(rawConsent, ["externalAI"], ["externalAI"], "consent");
  if (rawConsent.externalAI !== true) {
    throw new ValidationError("external_ai_consent_required", "consent.externalAI");
  }

  const evidence = stringArray(body.actionableEvidence, "actionableEvidence", {
    maxItems: 24,
    itemMax: 500,
  });
  if (evidence.some((item) => !SAFE_TEXT.test(item))) {
    throw new ValidationError("invalid_text", "actionableEvidence");
  }

  return {
    question,
    locale,
    consent: { externalAI: true },
    actionableEvidence: evidence,
  };
}
