import { RestaurantStatus } from "@prisma/client";
import { z } from "zod";

const optionalTrimmedText = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().max(maxLength).optional()
  );

export const restaurantPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Restaurant name must be at least 2 characters.")
    .max(120, "Restaurant name must be 120 characters or fewer."),
  segment: optionalTrimmedText(80),
  cuisine: optionalTrimmedText(80),
  websiteUrl: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z
      .string()
      .url("Enter a full URL, including https://.")
      .max(2048, "Website URL must be 2,048 characters or fewer.")
      .optional()
  ),
  notes: optionalTrimmedText(2000),
  status: z
    .enum([RestaurantStatus.ACTIVE, RestaurantStatus.PAUSED])
    .default(RestaurantStatus.ACTIVE)
});

export const restaurantListFilterSchema = z.object({
  q: optionalTrimmedText(120),
  status: z
    .enum([
      "ALL",
      RestaurantStatus.ACTIVE,
      RestaurantStatus.PAUSED,
      RestaurantStatus.ARCHIVED
    ])
    .default("ALL")
});

export type RestaurantPayload = z.infer<typeof restaurantPayloadSchema>;
export type RestaurantListFilters = z.infer<typeof restaurantListFilterSchema>;

export function restaurantValuesFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    segment: formData.get("segment"),
    cuisine: formData.get("cuisine"),
    websiteUrl: formData.get("websiteUrl"),
    notes: formData.get("notes"),
    status: formData.get("status")
  };
}

export function restaurantValuesForState(values: ReturnType<typeof restaurantValuesFromFormData>) {
  return {
    name: typeof values.name === "string" ? values.name : "",
    segment: typeof values.segment === "string" ? values.segment : "",
    cuisine: typeof values.cuisine === "string" ? values.cuisine : "",
    websiteUrl: typeof values.websiteUrl === "string" ? values.websiteUrl : "",
    notes: typeof values.notes === "string" ? values.notes : "",
    status: typeof values.status === "string" ? values.status : RestaurantStatus.ACTIVE
  };
}
