export type RestaurantFormValues = {
  name: string;
  segment: string;
  cuisine: string;
  websiteUrl: string;
  notes: string;
  status: string;
};

export type RestaurantFormField = keyof RestaurantFormValues;

export type RestaurantFormState = {
  message?: string;
  fieldErrors?: Partial<Record<RestaurantFormField, string[]>>;
  values?: Partial<RestaurantFormValues>;
};

export type LocationFormValues = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  timezone: string;
  latitude: string;
  longitude: string;
  status: string;
};

export type LocationFormField = keyof LocationFormValues;

export type LocationFormState = {
  message?: string;
  fieldErrors?: Partial<Record<LocationFormField, string[]>>;
  values?: Partial<LocationFormValues>;
};
