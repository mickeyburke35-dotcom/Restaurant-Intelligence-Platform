import { NextResponse } from "next/server";
import {
  demoLeadRequestSchema,
  demoLeadSource,
  type DemoLeadResponse
} from "@/lib/demo-leads";

export const runtime = "nodejs";

type SupabaseConfig = {
  insertUrl: URL;
  serviceRoleKey: string;
};

type SupabaseErrorBody = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

type LeadWebhookPayload = {
  email: string;
  source: typeof demoLeadSource;
  created_at: string;
};

const zapierLeadWebhookUrl =
  "https://hooks.zapier.com/hooks/catch/28124408/42jvbyn/";

function getSupabaseConfig(): SupabaseConfig | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase lead capture environment variables are missing.");
    return null;
  }

  try {
    return {
      insertUrl: new URL("/rest/v1/leads", supabaseUrl),
      serviceRoleKey
    };
  } catch (error) {
    console.error("Supabase URL is invalid.", error);
    return null;
  }
}

function isSupabaseErrorBody(value: unknown): value is SupabaseErrorBody {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "message" in value ||
    "code" in value ||
    "details" in value ||
    "hint" in value
  );
}

async function readSupabaseError(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return { message: "Supabase returned an empty error body." };
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return isSupabaseErrorBody(parsed) ? parsed : text;
  } catch {
    return text;
  }
}

function jsonResponse(body: DemoLeadResponse, status: number) {
  return NextResponse.json(body, { status });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown webhook error.";
}

function sendLeadWebhook(payload: LeadWebhookPayload) {
  void fetch(zapierLeadWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  })
    .then((response) => {
      if (!response.ok) {
        console.error("Zapier lead webhook failed.", {
          status: response.status,
          statusText: response.statusText
        });
      }
    })
    .catch((error: unknown) => {
      console.error("Zapier lead webhook failed.", {
        error: getErrorMessage(error)
      });
    });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      {
        ok: false,
        message: "Send a valid JSON request body."
      },
      400
    );
  }

  const parsed = demoLeadRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonResponse(
      {
        ok: false,
        message: "Check the email address and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors
      },
      400
    );
  }

  const supabaseConfig = getSupabaseConfig();

  if (!supabaseConfig) {
    return jsonResponse(
      {
        ok: false,
        message: "We could not save your request right now. Please try again soon."
      },
      500
    );
  }

  try {
    const insertResponse = await fetch(supabaseConfig.insertUrl, {
      method: "POST",
      headers: {
        apikey: supabaseConfig.serviceRoleKey,
        Authorization: `Bearer ${supabaseConfig.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        email: parsed.data.email,
        source: demoLeadSource
      }),
      cache: "no-store"
    });

    if (!insertResponse.ok) {
      const errorBody = await readSupabaseError(insertResponse);

      console.error("Supabase lead insert failed.", {
        status: insertResponse.status,
        statusText: insertResponse.statusText,
        error: errorBody
      });

      return jsonResponse(
        {
          ok: false,
          message: "We could not save your request right now. Please try again soon."
        },
        502
      );
    }

    sendLeadWebhook({
      email: parsed.data.email,
      source: demoLeadSource,
      created_at: new Date().toISOString()
    });

    return jsonResponse(
      {
        ok: true,
        message: "Thanks. We will follow up to schedule your demo."
      },
      201
    );
  } catch (error) {
    console.error("Lead capture request failed.", error);

    return jsonResponse(
      {
        ok: false,
        message: "We could not save your request right now. Please try again soon."
      },
      500
    );
  }
}
