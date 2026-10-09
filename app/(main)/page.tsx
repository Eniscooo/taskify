import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { HomeHeader } from "@/components/layout/home-header";
import { ProviderCard } from "@/components/hire/provider-card";
import { CategoryRail } from "@/components/marketplace/category-rail";
import { ModeSwitch } from "@/components/marketplace/mode-switch";
import { ProductCard, ProductGrid } from "@/components/marketplace/product-card";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SectionHeader } from "@/components/ui/card";
import { Rail, RailItem } from "@/components/ui/rail";
import { GridSkeleton } from "@/components/ui/skeleton";
import { getProviders, getUnreadCounts } from "@/lib/api";
import { CURRENT_USER_ID, DEFAULT_AREA } from "@/lib/constants";
import { cachedListings } from "@/lib/data/listings";
import { getSessionUser } from "@/lib/session";

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
      See all
      <span className="sr-only"> {label}</span>
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function Welcome({ name, area }: { name?: string; area: string }) {
  return (
    <div className="hidden md:block">
      <h1 id="hero-title" className="text-3xl font-extrabold tracking-tight">
        {name ? `Good afternoon, ${name.split(" ")[0]}` : "Welcome to Naija Market"}
      </h1>
      <p className="text-muted">Buy, sell and hire help around {area}, with your money protected.</p>
    </div>
  );
}

/*
 * The signed-in user is read per request, so the parts that depend on them
 * stream in behind <Suspense>. Everything else is prerendered.
 */

async function UserHeader() {
  const [user, counts] = await Promise.all([getSessionUser(), getUnreadCounts()]);
  const area = user?.area ?? DEFAULT_AREA;
  return (
    <>
      <HomeHeader area={area} unread={user ? counts.notifications : 0} />
      <Welcome name={user?.name} area={area} />
    </>
  );
}

/** Mock order alert; only the demo user has orders so far. */
async function HandoverAlert() {
  const user = await getSessionUser();
  if (user?.id !== CURRENT_USER_ID) return null;
  return (
    <Link
      href="/orders/NM-20431"
      className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <ShieldCheck aria-hidden className="h-8 w-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">Tunde handed over your iPhone 13</p>
        <p className="text-sm text-white/85">Got it? Confirm so we can release ₦375,000.</p>
      </div>
      <ArrowRight aria-hidden className="h-5 w-5 shrink-0" />
    </Link>
  );
}

async function NearbyListings() {
  const area = (await getSessionUser())?.area ?? DEFAULT_AREA;
  const nearby = await cachedListings({ area, sort: "newest", limit: 6 });
  return (
    <section aria-labelledby="nearby-title">
      <SectionHeader
        id="nearby-title"
        title="Nearby listings"
        subtitle={`Close to ${area}`}
        action={<SeeAll href={`/marketplace?area=${encodeURIComponent(area)}`} label="nearby listings" />}
      />
      <ProductGrid listings={nearby} />
    </section>
  );
}

export default async function HomePage() {
  const [recommended, providers] = await Promise.all([
    cachedListings({ sort: "recommended", limit: 4 }),
    getProviders(),
  ]);

  return (
    <div className="space-y-7">
      <section aria-labelledby="hero-title" className="space-y-4">
        <Suspense
          fallback={
            <>
              <HomeHeader area={DEFAULT_AREA} unread={0} />
              <Welcome area={DEFAULT_AREA} />
            </>
          }
        >
          <UserHeader />
        </Suspense>
        <h1 className="sr-only md:hidden">Naija Market home</h1>
        <SearchBar className="md:hidden" />
        <ModeSwitch active="buy" />
      </section>

      <CategoryRail />

      <Suspense>
        <HandoverAlert />
      </Suspense>

      <Suspense fallback={<GridSkeleton count={6} />}>
        <NearbyListings />
      </Suspense>

      <section aria-labelledby="providers-title">
        <SectionHeader
          id="providers-title"
          title="Trusted help nearby"
          subtitle="ID-verified providers"
          action={<SeeAll href="/hire" label="service providers" />}
        />
        <Rail label="Nearby service providers">
          {providers.slice(0, 6).map((p) => (
            <RailItem key={p.id}>
              <ProviderCard provider={p} variant="tile" />
            </RailItem>
          ))}
        </Rail>
      </section>

      <section aria-labelledby="recommended-title">
        <SectionHeader
          id="recommended-title"
          title="Recommended for you"
          action={<SeeAll href="/marketplace" label="recommended listings" />}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((l) => (
            <ProductCard key={l.id} listing={l} variant="large" />
          ))}
        </div>
      </section>
    </div>
  );
}
