import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { HomeHeader } from "@/components/layout/home-header";
import { ProviderCard } from "@/components/hire/provider-card";
import { CategoryRail } from "@/components/marketplace/category-rail";
import { ModeSwitch } from "@/components/marketplace/mode-switch";
import { ProductCard, ProductGrid } from "@/components/marketplace/product-card";
import { SearchBar } from "@/components/marketplace/search-bar";
import { SectionHeader } from "@/components/ui/card";
import { Rail, RailItem } from "@/components/ui/rail";
import {
  getCurrentUser,
  getNearbyListings,
  getProviders,
  getRecommendedListings,
  getUnreadCounts,
} from "@/lib/api";

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
      See all
      <span className="sr-only"> {label}</span>
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

export default async function HomePage() {
  const [user, counts, nearby, recommended, providers] = await Promise.all([
    getCurrentUser(),
    getUnreadCounts(),
    getNearbyListings(6),
    getRecommendedListings(4),
    getProviders(),
  ]);

  return (
    <div className="space-y-7">
      <HomeHeader area={user.area} unread={counts.notifications} />

      <section aria-labelledby="hero-title" className="space-y-4">
        <div className="hidden md:block">
          <h1 id="hero-title" className="text-3xl font-extrabold tracking-tight">
            Good afternoon, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted">Buy, sell and hire help around {user.area}, with your money protected.</p>
        </div>
        <h1 className="sr-only md:hidden">Naija Market home</h1>
        <SearchBar className="md:hidden" />
        <ModeSwitch active="buy" />
      </section>

      <CategoryRail />

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

      <section aria-labelledby="nearby-title">
        <SectionHeader
          id="nearby-title"
          title="Nearby listings"
          subtitle={`Close to ${user.area}`}
          action={<SeeAll href="/marketplace?sort=nearest" label="nearby listings" />}
        />
        <ProductGrid listings={nearby} />
      </section>

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
