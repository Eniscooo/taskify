/**
 * Naija Market API client.
 *
 * Every function here mirrors an endpoint of the planned NestJS REST API.
 * They currently resolve against in-memory mock data; swap the bodies for
 * `request()` calls when the backend is ready — the UI only depends on the
 * signatures and return types.
 */
import { CURRENT_USER_ID, PLATFORM_FEE_RATE, type SortOption } from "./constants";
import * as db from "./mock-data";
import type {
  Area,
  Condition,
  DeliveryMethod,
  Listing,
  ListingCategory,
  Message,
  Order,
  ServiceCategory,
  Task,
  User,
} from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.naijamarket.ng/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Generic REST helper for when the real API is wired up. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, "Request failed");
  return res.json() as Promise<T>;
}

const clone = <T>(value: T): T => structuredClone(value);

// ---------------------------------------------------------------------------
// Auth (phone-first, OTP verified)
// ---------------------------------------------------------------------------

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(input: { identifier: string; password: string }) {
  await wait(700);
  if (input.password.length < 6) throw new ApiError(401, "Incorrect phone/email or password");
  return { userId: CURRENT_USER_ID };
}

export async function register(input: { name: string; phone: string; email: string; password: string }) {
  await wait(700);
  return { userId: `u-${input.phone.slice(-4)}`, otpSentTo: input.phone };
}

export async function requestOtp(phoneOrEmail: string) {
  await wait(500);
  return { sentTo: phoneOrEmail };
}

export async function verifyOtp(target: string, code: string) {
  await wait(700);
  if (code.length !== 6) throw new ApiError(400, "Invalid code");
  return { verified: true, target };
}

export async function resetPassword(target: string, password: string) {
  await wait(600);
  return { ok: password.length >= 8 && !!target };
}

// ---------------------------------------------------------------------------
// Users & profiles
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<User> {
  return clone(db.users.find((u) => u.id === CURRENT_USER_ID)!);
}

export async function getUser(id: string): Promise<User | null> {
  const user = db.users.find((u) => u.id === id);
  return user ? clone(user) : null;
}

export async function getProfile(username: string): Promise<User | null> {
  const user = db.users.find((u) => u.username === username);
  return user ? clone(user) : null;
}

export async function updateProfile(patch: Partial<Pick<User, "name" | "email" | "phone" | "area" | "bio">>) {
  const user = db.users.find((u) => u.id === CURRENT_USER_ID)!;
  Object.assign(user, patch);
  return clone(user);
}

export async function getReviews(targetUserId: string) {
  return clone(db.reviews.filter((r) => r.targetId === targetUserId));
}

export async function createReview(input: { targetId: string; rating: number; body: string; context: string }) {
  const review = {
    id: `r-${db.reviews.length + 1}`,
    authorName: "Adaeze O.",
    createdAt: new Date().toISOString(),
    ...input,
  };
  db.reviews.unshift(review);
  return clone(review);
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export interface ListingFilters {
  q?: string;
  category?: ListingCategory;
  area?: Area;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  delivery?: DeliveryMethod;
  sort?: SortOption;
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const q = filters.q?.trim().toLowerCase();
  let results = db.listings.filter((l) => l.status === "active");

  if (q) {
    results = results.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.includes(q) ||
        l.area.toLowerCase().includes(q),
    );
  }
  if (filters.category) results = results.filter((l) => l.category === filters.category);
  if (filters.area) results = results.filter((l) => l.area === filters.area);
  if (filters.condition) results = results.filter((l) => l.condition === filters.condition);
  if (filters.delivery) {
    results = results.filter((l) => l.delivery === filters.delivery || l.delivery === "both");
  }
  if (filters.minPrice != null) results = results.filter((l) => l.price >= filters.minPrice!);
  if (filters.maxPrice != null) results = results.filter((l) => l.price <= filters.maxPrice!);

  switch (filters.sort) {
    case "nearest":
      results.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case "newest":
      results.sort((a, b) => b.postedAt.localeCompare(a.postedAt));
      break;
    case "price-asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      results.sort((a, b) => b.price - a.price);
      break;
    default:
      results.sort((a, b) => b.views - a.views);
  }
  return clone(results);
}

export async function getNearbyListings(limit = 6) {
  return (await getListings({ sort: "nearest" })).slice(0, limit);
}

export async function getRecommendedListings(limit = 4) {
  return (await getListings({ sort: "recommended" })).slice(0, limit);
}

export async function getListing(id: string): Promise<Listing | null> {
  const listing = db.listings.find((l) => l.id === id);
  return listing ? clone(listing) : null;
}

export async function getSimilarListings(id: string, limit = 4) {
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) return [];
  return clone(
    db.listings
      .filter((l) => l.id !== id && l.category === listing.category && l.status === "active")
      .slice(0, limit),
  );
}

export async function getMyListings() {
  return clone(db.listings.filter((l) => l.sellerId === CURRENT_USER_ID));
}

export async function getSavedListings() {
  const saved = ["l-1003", "l-1010", "l-1009"];
  return clone(db.listings.filter((l) => saved.includes(l.id)));
}

export interface ListingInput {
  title: string;
  category: ListingCategory;
  condition: Condition;
  price: number;
  area: Area;
  delivery: DeliveryMethod;
  description: string;
  photoCount: number;
}

export async function createListing(input: ListingInput, opts: { draft?: boolean } = {}) {
  const listing: Listing = {
    ...input,
    id: `l-${2000 + db.listings.length}`,
    sellerId: CURRENT_USER_ID,
    postedAt: new Date().toISOString(),
    distanceKm: 0,
    status: opts.draft ? "draft" : "active",
    views: 0,
  };
  db.listings.unshift(listing);
  return clone(listing);
}

export async function updateListing(id: string, patch: Partial<Listing>) {
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) throw new ApiError(404, "Listing not found");
  Object.assign(listing, patch);
  return clone(listing);
}

// ---------------------------------------------------------------------------
// Hire help: providers, tasks, offers
// ---------------------------------------------------------------------------

export async function getProviders(filters: { service?: ServiceCategory; q?: string } = {}) {
  const q = filters.q?.toLowerCase();
  return clone(
    db.providers
      .filter((p) => !filters.service || p.service === filters.service)
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
      .sort((a, b) => a.distanceKm - b.distanceKm),
  );
}

export async function getProvider(id: string) {
  const provider = db.providers.find((p) => p.id === id);
  return provider ? clone(provider) : null;
}

export async function getTasks() {
  return clone(db.tasks.filter((t) => t.customerId === CURRENT_USER_ID));
}

export async function getTask(id: string) {
  const task = db.tasks.find((t) => t.id === id);
  return task ? clone(task) : null;
}

export async function createTask(input: Omit<Task, "id" | "customerId" | "postedAt" | "status">) {
  const task: Task = {
    ...input,
    id: `t-${600 + db.tasks.length}`,
    customerId: CURRENT_USER_ID,
    postedAt: new Date().toISOString(),
    status: "open",
  };
  db.tasks.unshift(task);
  return clone(task);
}

export async function getTaskOffers(taskId: string) {
  return clone(db.offers.filter((o) => o.taskId === taskId));
}

export async function acceptOffer(offerId: string) {
  const offer = db.offers.find((o) => o.id === offerId);
  if (!offer) throw new ApiError(404, "Offer not found");
  const task = db.tasks.find((t) => t.id === offer.taskId);
  if (task) task.status = "assigned";
  return { orderId: "NM-20377" };
}

// ---------------------------------------------------------------------------
// Orders, payments & disputes
// ---------------------------------------------------------------------------

export async function getOrders(role: "buying" | "selling") {
  return clone(
    db.orders
      .filter((o) => (role === "buying" ? o.buyerId : o.sellerId) === CURRENT_USER_ID)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function getOrder(id: string): Promise<Order | null> {
  const order = db.orders.find((o) => o.id === id);
  return order ? clone(order) : null;
}

export async function createOrder(listingId: string) {
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) throw new ApiError(404, "Listing not found");
  return {
    amount: listing.price,
    fee: Math.round(listing.price * PLATFORM_FEE_RATE),
    // Paystack authorization URL would be returned here.
    checkoutUrl: `/orders/NM-20431`,
  };
}

export async function confirmReceipt(orderId: string) {
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new ApiError(404, "Order not found");
  order.status = "completed";
  return clone(order);
}

export async function markHandedOver(orderId: string) {
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new ApiError(404, "Order not found");
  order.status = "handed-over";
  return clone(order);
}

export async function openDispute(input: { orderId: string; reason: string; details: string; evidenceCount: number }) {
  const order = db.orders.find((o) => o.id === input.orderId);
  if (order) order.status = "disputed";
  return { disputeId: `D-${1043 + db.disputes.length}` };
}

// ---------------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------------

export async function getConversations() {
  return clone([...db.conversations].sort((a, b) => b.lastAt.localeCompare(a.lastAt)));
}

/** Existing thread for a listing, or a `new-<listingId>` id that opens a fresh one. */
export async function getConversationIdForListing(listingId: string) {
  return db.conversations.find((c) => c.listingId === listingId)?.id ?? `new-${listingId}`;
}

/** Existing thread with a user, if any. */
export async function getConversationIdForUser(userId: string) {
  return db.conversations.find((c) => c.participantId === userId)?.id ?? null;
}

export async function getConversation(id: string) {
  let conversation = db.conversations.find((c) => c.id === id);
  if (!conversation && id.startsWith("new-")) {
    const listing = db.listings.find((l) => l.id === id.slice(4));
    if (!listing) return null;
    conversation = { id, participantId: listing.sellerId, listingId: listing.id, lastMessage: "", lastAt: listing.postedAt, unread: 0 };
  }
  if (!conversation) return null;
  return {
    conversation: clone(conversation),
    messages: clone(db.messages.filter((m) => m.conversationId === id)),
  };
}

export async function sendMessage(conversationId: string, body: string, image = false): Promise<Message> {
  const message: Message = {
    id: `m-${Date.now()}`,
    conversationId,
    senderId: CURRENT_USER_ID,
    body,
    sentAt: new Date().toISOString(),
    image,
  };
  db.messages.push(message);
  return clone(message);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function getNotifications() {
  return clone(db.notifications);
}

export async function getUnreadCounts() {
  return {
    notifications: db.notifications.filter((n) => !n.read).length,
    messages: db.conversations.reduce((sum, c) => sum + c.unread, 0),
    orders: db.orders.filter(
      (o) => o.buyerId === CURRENT_USER_ID && o.status === "handed-over",
    ).length,
  };
}

// ---------------------------------------------------------------------------
// Search helpers
// ---------------------------------------------------------------------------

export async function getSearchSuggestions() {
  return { recent: [...db.recentSearches], suggested: [...db.suggestedSearches] };
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function getAdminStats() {
  // Queue counts are derived from the rows so every admin view agrees.
  return {
    ...clone(db.adminStats),
    pendingDisputes: db.disputes.filter((d) => d.status === "open" || d.status === "under-review").length,
    pendingPayouts: db.payouts.filter((p) => p.status === "pending" || p.status === "failed").length,
  };
}

export async function getAdminUsers() {
  return clone(db.users);
}

export async function getAdminListings() {
  return clone(db.listings);
}

export async function getAdminOrders() {
  return clone(db.orders);
}

export async function getAdminDisputes() {
  return clone(db.disputes);
}

export async function getAdminPayouts() {
  return clone(db.payouts);
}

/** Static ids for prerendering dynamic routes. */
export const staticIds = {
  listings: () => db.listings.map((l) => ({ id: l.id })),
  providers: () => db.providers.map((p) => ({ id: p.id })),
  tasks: () => db.tasks.map((t) => ({ id: t.id })),
  orders: () => db.orders.map((o) => ({ id: o.id })),
  conversations: () => db.conversations.map((c) => ({ conversationId: c.id })),
  usernames: () => db.users.map((u) => ({ username: u.username })),
};
