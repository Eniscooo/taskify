/** Client-side validation rules. The API re-validates everything server-side. */

export type Errors<T extends string> = Partial<Record<T, string>>;

export interface ListingDraft {
  photos: number;
  title: string;
  category: string;
  condition: string;
  price: string;
  area: string;
  delivery: string;
  description: string;
}

export function validateListing(d: ListingDraft): Errors<keyof ListingDraft> {
  const e: Errors<keyof ListingDraft> = {};
  if (d.photos < 1) e.photos = "Add at least one photo. Listings with photos sell 3× faster.";
  if (d.title.trim().length < 5) e.title = "Give your item a clear title (at least 5 characters).";
  if (!d.category) e.category = "Choose a category.";
  if (!d.condition) e.condition = "Choose the item's condition.";
  const price = Number(d.price);
  if (!d.price) e.price = "Enter a price.";
  else if (!Number.isFinite(price) || price < 100) e.price = "Price must be at least ₦100.";
  if (!d.area) e.area = "Choose where the item is.";
  if (!d.delivery) e.delivery = "Choose how the buyer gets the item.";
  if (d.description.trim().length < 20) e.description = "Describe the item in at least 20 characters.";
  return e;
}

export function validateNigerianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return /^(0[789][01]\d{8}|234[789][01]\d{8})$/.test(digits);
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Strip non-digits so "₦385,000" → "385000". */
export function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}
