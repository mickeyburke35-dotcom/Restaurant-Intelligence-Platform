import { LocationStatus } from "@prisma/client";
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

const optionalCoordinate = (minimum: number, maximum: number, label: string) =>
  z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.coerce
      .number({
        invalid_type_error: `${label} must be a number.`
      })
      .min(minimum, `${label} is outside the supported range.`)
      .max(maximum, `${label} is outside the supported range.`)
      .optional()
  );

export const locationPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Location name must be at least 2 characters.")
    .max(160, "Location name must be 160 characters or fewer."),
  addressLine1: optionalTrimmedText(200),
  addressLine2: optionalTrimmedText(200),
  city: optionalTrimmedText(120),
  region: optionalTrimmedText(120),
  postalCode: optionalTrimmedText(32),
  country: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed.toUpperCase();
    },
    z
      .string()
      .length(2, "Country must use a 2-letter code.")
      .default("US")
  ),
  timezone: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return value;
      }

      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z
      .string()
      .max(100, "Timezone must be 100 characters or fewer.")
      .default("America/New_York")
  ),
  latitude: optionalCoordinate(-90, 90, "Latitude"),
  longitude: optionalCoordinate(-180, 180, "Longitude"),
  status: z
    .enum([LocationStatus.ACTIVE, LocationStatus.PAUSED, LocationStatus.CLOSED])
    .default(LocationStatus.ACTIVE)
});

export const locationListFilterSchema = z.object({
  q: optionalTrimmedText(120),
  status: z
    .enum([
      "ALL",
      LocationStatus.ACTIVE,
      LocationStatus.PAUSED,
      LocationStatus.CLOSED,
      LocationStatus.ARCHIVED
    ])
    .default("ALL")
});

export type LocationPayload = z.infer<typeof locationPayloadSchema>;
export type LocationListFilters = z.infer<typeof locationListFilterSchema>;

export function locationValuesFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    region: formData.get("region"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    timezone: formData.get("timezone"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    status: formData.get("status")
  };
}

export function locationValuesForState(values: ReturnType<typeof locationValuesFromFormData>) {
  return {
    name: typeof values.name === "string" ? values.name : "",
    addressLine1: typeof values.addressLine1 === "string" ? values.addressLine1 : "",
    addressLine2: typeof values.addressLine2 === "string" ? values.addressLine2 : "",
    city: typeof values.city === "string" ? values.city : "",
    region: typeof values.region === "string" ? values.region : "",
    postalCode: typeof values.postalCode === "string" ? values.postalCode : "",
    country: typeof values.country === "string" ? values.country : "US",
    timezone: typeof values.timezone === "string" ? values.timezone : "America/New_York",
    latitude: typeof values.latitude === "string" ? values.latitude : "",
    longitude: typeof values.longitude === "string" ? values.longitude : "",
    status: typeof values.status === "string" ? values.status : LocationStatus.ACTIVE
  };
}
