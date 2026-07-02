import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { LocationNotFoundError } from "@/lib/locations";
import { AccessError } from "@/lib/request-context";
import { RestaurantNotFoundError } from "@/lib/restaurants";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: 400 | 404 | 409 | 422 | 500 = 400,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function badRequest(message: string, details?: unknown): ApiError {
  return new ApiError(message, 400, details);
}

export function notFound(message: string): ApiError {
  return new ApiError(message, 404);
}

export async function readJsonRequest(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
}

export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: "Validation failed.",
      fieldErrors: error.flatten().fieldErrors
    },
    {
      status: 400
    }
  );
}

function apiErrorMessageForConflict(error: Prisma.PrismaClientKnownRequestError): string {
  const target = JSON.stringify(error.meta?.target ?? "");
  const isLocationNameConflict =
    target.includes("restaurantId") || target.includes("restaurant_id");

  return isLocationNameConflict
    ? "A location with this name already exists for the restaurant."
    : "A record with these details already exists for this agency.";
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          details: error.flatten().fieldErrors,
          message: "Validation failed."
        }
      },
      {
        status: 400
      }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          details: error.details,
          message: error.message
        }
      },
      {
        status: error.statusCode
      }
    );
  }

  if (error instanceof AccessError) {
    return NextResponse.json(
      {
        error: {
          message: error.message
        }
      },
      {
        status: error.statusCode
      }
    );
  }

  if (error instanceof RestaurantNotFoundError || error instanceof LocationNotFoundError) {
    return NextResponse.json(
      {
        error: {
          message: error.message
        }
      },
      {
        status: 404
      }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json(
      {
        error: {
          message: apiErrorMessageForConflict(error)
        }
      },
      {
        status: 409
      }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: {
        message: "We could not complete this request."
      }
    },
    {
      status: 500
    }
  );
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return validationErrorResponse(error);
  }

  if (error instanceof AccessError) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: error.statusCode
      }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: error.statusCode
      }
    );
  }

  if (error instanceof RestaurantNotFoundError) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 404
      }
    );
  }

  if (error instanceof LocationNotFoundError) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 404
      }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json(
      {
        error: apiErrorMessageForConflict(error)
      },
      {
        status: 409
      }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: "We could not complete this restaurant request."
    },
    {
      status: 500
    }
  );
}
