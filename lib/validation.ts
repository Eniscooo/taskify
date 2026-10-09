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
  return /^(0[789][01]\d{8}|234[789][01]\d{8}|[789][01]\d{8})$/.test(digits);
}

/** "0803 412 7790", "803 412 7790" or "+234 803…" → "+2348034127790", the format the API stores. */
export function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  return `+234${digits.replace(/^0/, "")}`;
}

/** "+2348034127790" → "0803 412 7790", how Nigerians write numbers. */
export function formatNigerianPhone(e164: string) {
  const local = `0${e164.replace(/^\+234/, "")}`;
  return local.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3");
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Strip non-digits so "₦385,000" → "385000". */
export function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}
