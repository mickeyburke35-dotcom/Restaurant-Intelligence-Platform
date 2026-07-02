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
