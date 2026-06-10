import type { PublicErrorCode } from "@/config/error-messages";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: PublicErrorCode;
    message: string;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type { PublicErrorCode };
