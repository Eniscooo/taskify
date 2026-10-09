export type Area =
  | "Yaba"
  | "Surulere"
  | "Lekki"
  | "Ikeja"
  | "Victoria Island"
  | "Ikoyi"
  | "Gbagada"
  | "Maryland"
  | "Ajah"
  | "Lagos Island";

export type ListingCategory =
  | "phones"
  | "electronics"
  | "furniture"
  | "fashion"
  | "vehicles"
  | "home";

export type Condition = "new" | "like-new" | "used-good" | "used-fair";

export type DeliveryMethod = "pickup" | "seller-delivers" | "both";

export type ServiceCategory =
  | "plumbing"
  | "cleaning"
  | "electrical"
  | "moving"
  | "ac-repair"
  | "painting"
  | "carpentry"
  | "generator-repair";

export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  area: Area;
  verified: boolean;
  phoneVerified: boolean;
  rating: number;
  reviewCount: number;
  salesCount: number;
  jobsCount: number;
  listingsCount: number;
  joinedAt: string;
  responseTime: string;
  bio?: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: ListingCategory;
  condition: Condition;
  area: Area;
  delivery: DeliveryMethod;
  description: string;
  photoCount: number;
  sellerId: string;
  postedAt: string;
  distanceKm: number;
  status: "active" | "draft" | "sold" | "flagged" | "removed";
  views: number;
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  service: ServiceCategory;
  title: string;
  verified: boolean;
  rating: number;
  jobs: number;
  distanceKm: number;
  startingPrice: number;
  area: Area;
  responseTime: string;
  about: string;
  services: { name: string; price: number }[];
  availability: string[];
  portfolioCount: number;
}

export type PaymentStatus =
  | "awaiting-payment"
  | "paid"
  | "held"
  | "handed-over"
  | "completed"
  | "cancelled"
  | "disputed"
  | "refunded";

export interface Order {
  id: string;
  kind: "item" | "service";
  listingId?: string;
  taskId?: string;
  title: string;
  amount: number;
  fee: number;
  status: PaymentStatus;
  buyerId: string;
  sellerId: string;
  createdAt: string;
  fulfilment: string;
  autoReleaseAt?: string;
  timeline: { label: string; at?: string; done: boolean }[];
}

export interface Task {
  id: string;
  title: string;
  service: ServiceCategory;
  area: Area;
  when: string;
  budget: number;
  description: string;
  customerId: string;
  postedAt: string;
  status: "open" | "assigned" | "completed" | "cancelled";
}

export interface Offer {
  id: string;
  taskId: string;
  providerId: string;
  price: number;
  message: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
  image?: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  listingId?: string;
  taskId?: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export interface Review {
  id: string;
  authorName: string;
  targetId: string;
  rating: number;
  body: string;
  createdAt: string;
  context: string;
}

export type NotificationKind =
  | "payment"
  | "handover"
  | "offer"
  | "payout"
  | "message"
  | "dispute"
  | "review";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  openedBy: string;
  amount: number;
  status: "open" | "under-review" | "resolved-buyer" | "resolved-seller";
  createdAt: string;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  bank: string;
  accountLast4: string;
  status: "pending" | "processing" | "paid" | "failed";
  orderId: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeListings: number;
  orders: number;
  gmv: number;
  pendingDisputes: number;
  pendingPayouts: number;
}

export interface ConversationRow {
  conversation: Conversation;
  participant: User;
  subject: string;
}
