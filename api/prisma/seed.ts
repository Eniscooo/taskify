/**
 * Development seed: loads the web app's mock users, categories and listings
 * so the API and the frontend show the same data. Safe to re-run.
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { LISTING_CATEGORIES } from "../../lib/constants.js";
import { listings as mockListings, users as mockUsers } from "../../lib/mock-data.js";
import { PrismaClient, type DeliveryMethod, type ListingCondition } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  // Categories
  for (const [i, c] of LISTING_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: c.id },
      update: { name: c.label, sortOrder: i },
      create: { slug: c.id, name: c.label, sortOrder: i },
    });
  }
  const categoryIds = new Map((await prisma.category.findMany()).map((c) => [c.slug, c.id]));

  // Users (mock ids like "u-tunde" map to generated UUIDs via username)
  const userIds = new Map<string, string>();
  for (const u of mockUsers) {
    const joined = new Date(u.joinedAt);
    const data = {
      name: u.name,
      phone: u.phone.replace(/\s/g, ""),
      email: u.email,
      area: u.area,
      bio: u.bio ?? null,
      phoneVerifiedAt: u.phoneVerified ? joined : null,
      emailVerifiedAt: joined,
      idVerifiedAt: u.verified ? joined : null,
    };
    const row = await prisma.user.upsert({
      where: { username: u.username },
      update: data,
      create: { username: u.username, createdAt: joined, ...data },
    });
    userIds.set(u.id, row.id);
  }

  // Listings: replace the seeded users' listings wholesale.
  await prisma.listing.deleteMany({ where: { sellerId: { in: [...userIds.values()] } } });
  for (const l of mockListings) {
    const posted = new Date(l.postedAt);
    await prisma.listing.create({
      data: {
        sellerId: userIds.get(l.sellerId)!,
        categoryId: categoryIds.get(l.category)!,
        title: l.title,
        description: l.description,
        priceKobo: BigInt(l.price) * 100n,
        condition: l.condition.replace(/-/g, "_") as ListingCondition,
        delivery: l.delivery.replace(/-/g, "_") as DeliveryMethod,
        area: l.area,
        status: l.status,
        views: l.views,
        publishedAt: l.status === "draft" ? null : posted,
        createdAt: posted,
        // Placeholder object keys; real photos are uploaded to R2 by the media module.
        images: {
          create: Array.from({ length: l.photoCount }, (_, i) => ({
            storageKey: `seed/${l.id}/${i + 1}.jpg`,
            position: i,
          })),
        },
      },
    });
  }

  const counts = await Promise.all([prisma.category.count(), prisma.user.count(), prisma.listing.count()]);
  console.log(`Seeded ${counts[0]} categories, ${counts[1]} users, ${counts[2]} listings.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
