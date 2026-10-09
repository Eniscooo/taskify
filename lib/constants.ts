import type {
  Area,
  Condition,
  DeliveryMethod,
  ListingCategory,
  PaymentStatus,
  ServiceCategory,
} from "./types";

/** Base URL of the Naija Market API, including the version prefix. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";

/** Area used before a signed-out visitor or new user picks one. */
export const DEFAULT_AREA: Area = "Yaba";

export const AREAS: Area[] = [
  "Yaba",
  "Surulere",
  "Lekki",
  "Ikeja",
  "Victoria Island",
  "Ikoyi",
  "Gbagada",
  "Maryland",
  "Ajah",
  "Lagos Island",
];

export const LISTING_CATEGORIES: { id: ListingCategory; label: string }[] = [
  { id: "phones", label: "Phones" },
  { id: "electronics", label: "Electronics" },
  { id: "furniture", label: "Furniture" },
  { id: "fashion", label: "Fashion" },
  { id: "vehicles", label: "Vehicles" },
  { id: "home", label: "Home" },
];

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "plumbing", label: "Plumbing" },
  { id: "cleaning", label: "Cleaning" },
  { id: "electrical", label: "Electrical" },
  { id: "moving", label: "Moving" },
  { id: "ac-repair", label: "AC Repair" },
  { id: "painting", label: "Painting" },
  { id: "carpentry", label: "Carpentry" },
  { id: "generator-repair", label: "Generator Repair" },
];

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: "new", label: "Brand new" },
  { id: "like-new", label: "Used, like new" },
  { id: "used-good", label: "Used, good" },
  { id: "used-fair", label: "Used, fair" },
];

export const DELIVERY_METHODS: { id: DeliveryMethod; label: string }[] = [
  { id: "pickup", label: "Pickup only" },
  { id: "seller-delivers", label: "Seller delivers" },
  { id: "both", label: "Pickup or seller delivers" },
];

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "newest", label: "Newest first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["id"];

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; tone: "neutral" | "brand" | "accent" | "danger" | "info"; description: string }
> = {
  "awaiting-payment": {
    label: "Awaiting payment",
    tone: "neutral",
    description: "The buyer hasn't paid yet.",
  },
  paid: {
    label: "Paid",
    tone: "info",
    description: "Payment confirmed by Paystack.",
  },
  held: {
    label: "Money held",
    tone: "accent",
    description: "Naija Market is holding the money safely.",
  },
  "handed-over": {
    label: "Handed over",
    tone: "info",
    description: "Seller says the item or job is done. Waiting for buyer to confirm.",
  },
  completed: {
    label: "Completed",
    tone: "brand",
    description: "Buyer confirmed. Seller has been paid.",
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    description: "This order was cancelled before payment.",
  },
  disputed: {
    label: "Disputed",
    tone: "danger",
    description: "A problem was reported. Money stays held during review.",
  },
  refunded: {
    label: "Refunded",
    tone: "neutral",
    description: "The money was returned to the buyer.",
  },
};

/** Days after hand-over before money is released automatically. */
export const AUTO_RELEASE_DAYS = 3;

/** Platform fee rate charged to the seller on completion. */
export const PLATFORM_FEE_RATE = 0.05;

export const CURRENT_USER_ID = "u-me";

/** Fixed reference time so mock data renders identically on server and client. */
export const MOCK_NOW = "2026-10-07T14:00:00+01:00";
