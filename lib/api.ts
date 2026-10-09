/**
 * Naija Market API client.
 *
 * Every function here mirrors an endpoint of the NestJS REST API. Listings
 * are served by the API; the rest still resolve against in-memory mock data
 * until their backend modules are built. The UI only depends on the
 * signatures and return types, so each one can be swapped independently.
 */
import { API_BASE_URL, CURRENT_USER_ID, PLATFORM_FEE_RATE, SORT_OPTIONS, type SortOption } from "./constants";
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

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = "ERROR",
  ) {
    super(message);
  }
}

/**
 * REST helper. Sends the session cookie and turns the API's
 * `{ error: { code, message } }` body into an ApiError.
 */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: { ...(init?.body != null && { "Content-Type": "application/json" }), ...init?.headers },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    throw new ApiError(res.status, body?.error?.message ?? "Request failed", body?.error?.code);
  }
  return res.json() as Promise<T>;
}

/** Cursor-paginated list response from the API. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

const clone = <T>(value: T): T => structuredClone(value);

// ---------------------------------------------------------------------------
// Users & profiles (sign-in and the current user live in auth-client.ts and
// session.ts)
// ---------------------------------------------------------------------------

export async function getUser(id: string): Promise<User | null> {
  const user = db.users.find((u) => u.id === id);
  return user ? clone(user) : null;
}

export async function getProfile(username: string): Promise<User | null> {
  const user = db.users.find((u) => u.username === username);
  return user ? clone(user) : null;
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
  /** Seller's username. */
  seller?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  delivery?: DeliveryMethod;
  sort?: SortOption;
  /** Page size, 1–50. */
  limit?: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function listingQuery({ q, sort, limit = 50, ...rest }: ListingFilters) {
  const params = new URLSearchParams();
  // Old shared links can carry sorts the API no longer accepts (e.g. "nearest").
  const entries = { ...rest, q: q?.trim(), sort: SORT_OPTIONS.some((o) => o.id === sort) ? sort : undefined, limit };
  for (const [key, value] of Object.entries(entries)) {
    if (value != null && value !== "") params.set(key, String(value));
  }
  return `?${params}`;
}

/** First page of matching listings (up to `limit`, default 50). */
export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const page = await request<Page<Listing>>(`/listings${listingQuery(filters)}`);
  return page.items;
}

export async function getListing(id: string): Promise<Listing | null> {
  // Mock orders and chats still reference mock listing ids ("l-1003") until
  // those modules move to the API.
  if (!UUID_RE.test(id)) {
    const listing = db.listings.find((l) => l.id === id);
    return listing ? clone(listing) : null;
  }
  try {
    return await request<Listing>(`/listings/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getSimilarListings(id: string, limit = 4) {
  const listing = await getListing(id);
  if (!listing) return [];
  const sameCategory = await getListings({ category: listing.category, limit: limit + 1 });
  return sameCategory.filter((l) => l.id !== id).slice(0, limit);
}

/** Saved items are mock data, so only the demo user has any. */
export async function getSavedListings(userId: string) {
  if (userId !== CURRENT_USER_ID) return [];
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

export async function getOrders(role: "buying" | "selling", userId = CURRENT_USER_ID) {
  return clone(
    db.orders
      .filter((o) => (role === "buying" ? o.buyerId : o.sellerId) === userId)
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
    const listing = await getListing(id.slice(4));
    if (!listing) return null;
    // Messaging is still mock data, so match the API's seller to a mock user by username.
    const participantId = listing.seller
      ? db.users.find((u) => u.username === listing.seller!.username)?.id
      : listing.sellerId;
    if (!participantId) return null;
    conversation = { id, participantId, listingId: listing.id, lastMessage: "", lastAt: listing.postedAt, unread: 0 };
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
  /** The most-viewed listings; the rest render on first visit. */
  listings: async () => (await getListings({ limit: 20 })).map((l) => ({ id: l.id })),
  providers: () => db.providers.map((p) => ({ id: p.id })),
  tasks: () => db.tasks.map((t) => ({ id: t.id })),
  orders: () => db.orders.map((o) => ({ id: o.id })),
  conversations: () => db.conversations.map((c) => ({ conversationId: c.id })),
  usernames: () => db.users.map((u) => ({ username: u.username })),
};
