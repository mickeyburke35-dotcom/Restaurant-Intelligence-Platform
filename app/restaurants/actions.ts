"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import type { RestaurantFormState } from "@/app/restaurants/form-types";
import { AccessError, getActiveAgencyContext } from "@/lib/request-context";
import {
  archiveTenantRestaurant,
  createTenantRestaurant,
  RestaurantNotFoundError,
  updateTenantRestaurant
} from "@/lib/restaurants";
import {
  restaurantPayloadSchema,
  restaurantValuesForState,
  restaurantValuesFromFormData
} from "@/lib/restaurant-validation";

function stateFromError(error: unknown, values: RestaurantFormState["values"]): RestaurantFormState {
  if (error instanceof ZodError) {
    return {
      message: "Check the highlighted fields.",
      fieldErrors: error.flatten().fieldErrors,
      values
    };
  }

  if (error instanceof AccessError || error instanceof RestaurantNotFoundError) {
    return {
      message: error.message,
      values
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return {
      message: "A restaurant with these details already exists for this agency.",
      values
    };
  }

  console.error(error);

  return {
    message: "We could not save this restaurant.",
    values
  };
}

export async function createRestaurantAction(
  _previousState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const formValues = restaurantValuesFromFormData(formData);
  const values = restaurantValuesForState(formValues);
  const parsedPayload = restaurantPayloadSchema.safeParse(formValues);

  if (!parsedPayload.success) {
    return stateFromError(parsedPayload.error, values);
  }

  try {
    const context = await getActiveAgencyContext();
    await createTenantRestaurant(context, parsedPayload.data);
  } catch (error) {
    return stateFromError(error, values);
  }

  revalidatePath("/restaurants");
  redirect("/restaurants");
}

export async function updateRestaurantAction(
  restaurantId: string,
  _previousState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const formValues = restaurantValuesFromFormData(formData);
  const values = restaurantValuesForState(formValues);
  const parsedPayload = restaurantPayloadSchema.safeParse(formValues);

  if (!parsedPayload.success) {
    return stateFromError(parsedPayload.error, values);
  }

  try {
    const context = await getActiveAgencyContext();
    await updateTenantRestaurant(context, restaurantId, parsedPayload.data);
  } catch (error) {
    return stateFromError(error, values);
  }

  revalidatePath("/restaurants");
  revalidatePath(`/restaurants/${restaurantId}/edit`);
  redirect("/restaurants");
}

export async function archiveRestaurantAction(restaurantId: string): Promise<void> {
  const context = await getActiveAgencyContext();
  await archiveTenantRestaurant(context, restaurantId);
  revalidatePath("/restaurants");
}
