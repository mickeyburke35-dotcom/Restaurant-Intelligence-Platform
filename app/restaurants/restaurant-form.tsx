"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { RestaurantFormState, RestaurantFormValues } from "@/app/restaurants/form-types";

type RestaurantFormAction = (
  state: RestaurantFormState,
  formData: FormData
) => Promise<RestaurantFormState>;

type RestaurantFormProps = {
  action: RestaurantFormAction;
  initialValues?: Partial<RestaurantFormValues>;
  submitLabel: string;
  title: string;
  description: string;
};

const emptyValues: RestaurantFormValues = {
  name: "",
  segment: "",
  cuisine: "",
  websiteUrl: "",
  notes: "",
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

export function RestaurantForm({
  action,
  initialValues,
  submitLabel,
  title,
  description
}: RestaurantFormProps) {
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
          href="/restaurants"
          className="text-sm font-medium text-pine transition hover:text-pine-dark"
        >
          Back to restaurants
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
              Restaurant name
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

          <div>
            <label htmlFor="segment" className="block text-sm font-semibold text-ink">
              Segment
            </label>
            <input
              id="segment"
              name="segment"
              type="text"
              defaultValue={values.segment}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.segment} />
          </div>

          <div>
            <label htmlFor="cuisine" className="block text-sm font-semibold text-ink">
              Cuisine
            </label>
            <input
              id="cuisine"
              name="cuisine"
              type="text"
              defaultValue={values.cuisine}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.cuisine} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="websiteUrl" className="block text-sm font-semibold text-ink">
              Website URL
            </label>
            <input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              inputMode="url"
              defaultValue={values.websiteUrl}
              className="mt-2 h-10 w-full rounded-md border border-line bg-snow px-3 text-sm text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.websiteUrl} />
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
            </select>
            <FieldError errors={state.fieldErrors?.status} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-semibold text-ink">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              defaultValue={values.notes}
              className="mt-2 w-full rounded-md border border-line bg-snow px-3 py-2 text-sm leading-6 text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-lichen"
            />
            <FieldError errors={state.fieldErrors?.notes} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/restaurants"
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
