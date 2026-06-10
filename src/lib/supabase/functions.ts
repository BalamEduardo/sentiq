import { getSupabaseBrowserClient } from "./client";

type FunctionBody =
  | string
  | Blob
  | ArrayBuffer
  | FormData
  | ReadableStream<Uint8Array>
  | Record<string, unknown>;

export class SupabaseFunctionError extends Error {
  constructor(
    message: string,
    public readonly functionName: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "SupabaseFunctionError";
  }
}

export async function invokeFunction<TInput extends FunctionBody, TOutput>(
  functionName: string,
  input: TInput,
): Promise<TOutput> {
  const { data, error } = await getSupabaseBrowserClient().functions.invoke<TOutput>(
    functionName,
    {
      body: input,
    },
  );

  if (error) {
    throw new SupabaseFunctionError(
      `Supabase Edge Function failed: ${functionName}`,
      functionName,
      error,
    );
  }

  if (data === null) {
    throw new SupabaseFunctionError(
      `Supabase Edge Function returned no data: ${functionName}`,
      functionName,
    );
  }

  return data;
}
