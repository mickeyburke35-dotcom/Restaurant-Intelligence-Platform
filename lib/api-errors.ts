import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AccessError } from "@/lib/request-context";
import { RestaurantNotFoundError } from "@/lib/restaurants";

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

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json(
      {
        error: "A restaurant with these details already exists for this agency."
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
