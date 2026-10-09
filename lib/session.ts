import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { API_BASE_URL, DEFAULT_AREA } from "./constants";
import { users as mockUsers } from "./mock-data";
import type { Area, User } from "./types";

/** GET /v1/me */
interface MeResponse {
  id: string;
  username: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  email: string;
  verified: boolean;
  area: string | null;
  bio: string | null;
  joinedAt: string;
}

function toUser(me: MeResponse): User {
  // Ratings, sales, reviews and orders aren't in the API yet. Seeded users
  // keep their mock id and stats so those mock modules still find their data.
  const mock = mockUsers.find((u) => u.username === me.username);
  return {
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    jobsCount: 0,
    listingsCount: 0,
    responseTime: "New on Naija Market",
    ...mock,
    id: mock?.id ?? me.id,
    username: me.username,
    name: me.name,
    phone: me.phone,
    email: me.email,
    area: (me.area ?? DEFAULT_AREA) as Area,
    verified: me.verified,
    phoneVerified: me.phoneVerified,
    joinedAt: me.joinedAt,
    bio: me.bio ?? undefined,
  };
}

/**
 * The signed-in user, or null. Reads the session cookie, so call it inside a
 * <Suspense> boundary. Deduplicated per request.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const cookie = (await cookies()).toString();
  if (!cookie) return null;
  const res = await fetch(`${API_BASE_URL}/me`, { headers: { cookie } });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`GET /me failed with ${res.status}`);
  return toUser((await res.json()) as MeResponse);
});

/** The signed-in user; sends visitors to log in first. */
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}
