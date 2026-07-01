"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { LocationFormState, LocationFormValues } from "@/app/restaurants/form-types";

type LocationFormAction = (
  state: LocationFormState,
  formData: FormData
) => Promise<LocationFormState>;

type LocationFormProps = {
  action: LocationFormAction;
  backHref: string;
  initialValues?: Partial<LocationFormValues>;
  submitLabel: string;
  title: string;
  description: string;
};

const emptyValues: LocationFormValues = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
  timezone: "America/New_York",
  latitude: "",
  longitude: "",
  status: "ACTIVE"
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-pine px-4 text-sm font-semibold text-white transition hover:bg-pine-dark focus:outline-none focus:ring-2 focus:ring-lichen focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return <p className="mt-2 text-sm font-medium text-negative">{errors[0]}</p>;
}

export function LocationForm({
  action,
  backHref,
  initialValues,
  submitLabel,
  title,
  description
}: LocationFormProps) {
  const [state, formAction] = useActionState(action, {
    values: {
      ...emptyValues,
      ...initialValues
    }
  });
  const values = {
    ...emptyValues,
    ...initialValues,
    ...state.values
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <Link
          href={backHref}
          className="text-sm font-medium text-pine transition hover:text-pine-dark"
        >
          Back to locations
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>

      <form
        action={formAction}
        noValidate
        className="rounded-md border border-line bg-panel p-6 shadow-soft"
      >
        {state.message ? (
          <div className="mb-6 rounded-md border border-negative/30 bg-negative/10 px-4 py-3 text-sm font-medium text-negative">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-semibold text-ink">
              Location name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={values.name}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.name} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressLine1" className="block text-sm font-semibold text-ink">
              Address line 1
            </label>
            <input
              id="addressLine1"
              name="addressLine1"
              type="text"
              defaultValue={values.addressLine1}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.addressLine1} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressLine2" className="block text-sm font-semibold text-ink">
              Address line 2
            </label>
            <input
              id="addressLine2"
              name="addressLine2"
              type="text"
              defaultValue={values.addressLine2}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.addressLine2} />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-ink">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={values.city}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.city} />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-semibold text-ink">
              Region
            </label>
            <input
              id="region"
              name="region"
              type="text"
              defaultValue={values.region}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.region} />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-semibold text-ink">
              Postal code
            </label>
            <input
              id="postalCode"
              name="postalCode"
              type="text"
              defaultValue={values.postalCode}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.postalCode} />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-semibold text-ink">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              maxLength={2}
              defaultValue={values.country}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm uppercase text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.country} />
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-semibold text-ink">
              Timezone
            </label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              required
              defaultValue={values.timezone}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.timezone} />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-ink">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={values.status}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CLOSED">Closed</option>
            </select>
            <FieldError errors={state.fieldErrors?.status} />
          </div>

          <div>
            <label htmlFor="latitude" className="block text-sm font-semibold text-ink">
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              type="text"
              inputMode="decimal"
              defaultValue={values.latitude}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.latitude} />
          </div>

          <div>
            <label htmlFor="longitude" className="block text-sm font-semibold text-ink">
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              type="text"
              inputMode="decimal"
              defaultValue={values.longitude}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.longitude} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href={backHref}
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-panel px-4 text-sm font-semibold text-ink transition hover:border-pine hover:text-pine"
          >
            Cancel
          </Link>
          <SubmitButton label={submitLabel} />
        </div>
      </form>
    </section>
  );
}
