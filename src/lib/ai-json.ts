import { z } from "zod";
import { getOpenAI } from "@/lib/openai";
import { isAiRateLimited } from "@/lib/rate-limit";
import { AI_MODEL } from "@/lib/constants";

type AiJsonResult<T> = { success: true; data: T } | { success: false; error: string };

function extractValue(parsedJson: unknown, key: string, mode: "array" | "string"): unknown {
  if (mode === "array") {
    return Array.isArray(parsedJson) ? parsedJson : (parsedJson as Record<string, unknown>)?.[key];
  }
  return typeof parsedJson === "string" ? parsedJson : (parsedJson as Record<string, unknown>)?.[key];
}

// The model may reply with a bare value (string/array) or `{ [extractKey]: value }`.
export async function callAiJson<T>({
  userId,
  instructions,
  input,
  maxOutputTokens,
  extractKey,
  extractMode,
  resultSchema,
  errorMessage,
}: {
  userId: string;
  instructions: string;
  input: string;
  maxOutputTokens: number;
  extractKey: string;
  extractMode: "array" | "string";
  resultSchema: z.ZodType<T>;
  errorMessage: string;
}): Promise<AiJsonResult<T>> {
  if (await isAiRateLimited(userId)) {
    return { success: false, error: "Too many AI requests. Please try again in a bit." };
  }

  try {
    const response = await getOpenAI().responses.create({
      model: AI_MODEL,
      instructions,
      input,
      text: { format: { type: "json_object" } },
      reasoning: { effort: "low" },
      max_output_tokens: maxOutputTokens,
    });

    const raw = response.output_text || "{}";
    const parsedJson = JSON.parse(raw);
    const value = extractValue(parsedJson, extractKey, extractMode);

    const result = resultSchema.safeParse(value);
    if (!result.success) {
      return { success: false, error: "AI returned an unexpected format" };
    }

    return { success: true, data: result.data };
  } catch {
    return { success: false, error: errorMessage };
  }
}
