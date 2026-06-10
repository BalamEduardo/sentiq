export const UI_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  EMPTY: "empty",
  ERROR: "error",
  SUCCESS: "success",
} as const;

export type UiState = (typeof UI_STATES)[keyof typeof UI_STATES];
