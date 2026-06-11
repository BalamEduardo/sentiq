import { EDGE_FUNCTIONS } from "@/config/edge-functions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  GetPublicSurveyConfigResponse,
  SubmitFeedbackResponse,
} from "@/types/edge-functions";
import type { FeedbackSource, PublicSurveyPayload } from "@/types/domain";

export class PublicSurveyFunctionError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "PublicSurveyFunctionError";
    this.status = status;
  }
}

export async function getPublicSurveyConfig(
  token: string,
  source: FeedbackSource,
): Promise<GetPublicSurveyConfigResponse> {
  const { data, error } = await getSupabaseBrowserClient().functions.invoke(
    EDGE_FUNCTIONS.GET_PUBLIC_SURVEY_CONFIG,
    {
      body: { token, source },
    },
  );

  if (error || !data) {
    throw new PublicSurveyFunctionError("public_survey_config_failed", getFunctionStatus(error));
  }

  return data as GetPublicSurveyConfigResponse;
}

export async function submitPublicFeedback(
  payload: PublicSurveyPayload,
): Promise<SubmitFeedbackResponse> {
  const { data, error } = await getSupabaseBrowserClient().functions.invoke(
    EDGE_FUNCTIONS.SUBMIT_FEEDBACK,
    {
      body: payload,
    },
  );

  if (error || !data) {
    throw new PublicSurveyFunctionError("submit_feedback_failed", getFunctionStatus(error));
  }

  return data as SubmitFeedbackResponse;
}

function getFunctionStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const context = "context" in error ? error.context : undefined;

  if (context instanceof Response) {
    return context.status;
  }

  if (context && typeof context === "object" && "status" in context) {
    const status = context.status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}
