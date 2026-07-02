import "server-only";

export const GEMINI_MODEL = "gemini-3.5-flash";

const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

export type GeminiErrorDetails = {
  body: string;
  status: number;
};

export class GeminiJsonError extends Error {
  constructor(
    message: string,
    readonly details?: GeminiErrorDetails
  ) {
    super(message);
    this.name = "GeminiJsonError";
  }
}

export async function requestGeminiJson({
  input,
  schema,
  systemInstruction,
  temperature = 0.2
}: {
  input: string;
  schema: unknown;
  systemInstruction: string;
  temperature?: number;
}): Promise<unknown> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new GeminiJsonError("Google AI API key is not configured.");
  }

  const response = await fetch(GEMINI_INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      system_instruction: systemInstruction,
      input,
      store: false,
      generation_config: {
        temperature
      },
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema
      }
    }),
    cache: "no-store"
  });

  const responseBody = await response.text();

  if (!response.ok) {
    throw new GeminiJsonError("Gemini returned an error response.", {
      body: responseBody.slice(0, 1000),
      status: response.status
    });
  }

  const parsedJson = parseJson(responseBody);
  const outputText = extractOutputText(parsedJson);

  return outputText ? parseJson(outputText) : parsedJson;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractOutputText(value: unknown): string | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  for (const key of ["output_text", "outputText", "text"]) {
    const field = record[key];

    if (typeof field === "string") {
      return field;
    }
  }

  return extractGenerateContentText(record) ?? extractInteractionStepText(record);
}

function extractGenerateContentText(record: Record<string, unknown>): string | null {
  const candidates = record.candidates;

  if (!Array.isArray(candidates)) {
    return null;
  }

  const firstCandidate = asRecord(candidates[0]);
  const content = asRecord(firstCandidate?.content);
  const parts = content?.parts;

  if (!Array.isArray(parts)) {
    return null;
  }

  const text = parts
    .map((part) => asRecord(part)?.text)
    .filter((part): part is string => typeof part === "string")
    .join("");

  return text.length > 0 ? text : null;
}

function extractInteractionStepText(record: Record<string, unknown>): string | null {
  const steps = record.steps;

  if (!Array.isArray(steps)) {
    return null;
  }

  const textBlocks = steps.flatMap((step) => {
    const stepRecord = asRecord(step);

    if (!stepRecord || stepRecord.type !== "model_output") {
      return [];
    }

    const content = stepRecord.content;

    if (!Array.isArray(content)) {
      return [];
    }

    return content
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => item?.type === "text")
      .map((item) => item.text)
      .filter((text): text is string => typeof text === "string");
  });
  const text = textBlocks.join("");

  return text.length > 0 ? text : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}
