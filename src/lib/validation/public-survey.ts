import { FEEDBACK_SOURCES, isOneOf, isRatingValue } from "./domain-constants";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export type PublicSurveyValidationPayload = {
  token?: unknown;
  source?: unknown;
  general_experience?: unknown;
  service_attention?: unknown;
  food_quality?: unknown;
  service_speed?: unknown;
  customer_phone?: unknown;
  consent_to_contact?: unknown;
};

export function validatePhoneConsent(
  customerPhone: string | null | undefined,
  consentToContact: boolean | undefined,
): ValidationResult {
  if (customerPhone && consentToContact !== true) {
    return { ok: false, errors: ["customer_phone_requires_consent"] };
  }

  return { ok: true, errors: [] };
}

export function validatePublicSurveyPayload(payload: PublicSurveyValidationPayload): ValidationResult {
  const errors: string[] = [];

  if (typeof payload.token !== "string" || payload.token.trim().length === 0) {
    errors.push("token_required");
  }

  if (!isOneOf(payload.source, FEEDBACK_SOURCES)) {
    errors.push("invalid_source");
  }

  for (const field of ["general_experience", "service_attention", "food_quality", "service_speed"] as const) {
    if (!isRatingValue(payload[field])) {
      errors.push(`invalid_${field}`);
    }
  }

  const customerPhone = typeof payload.customer_phone === "string" ? payload.customer_phone : null;
  const consentToContact = typeof payload.consent_to_contact === "boolean" ? payload.consent_to_contact : undefined;

  errors.push(...validatePhoneConsent(customerPhone, consentToContact).errors);

  return { ok: errors.length === 0, errors };
}
