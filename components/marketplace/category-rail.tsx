import { LISTING_CATEGORIES } from "@/lib/constants";
import type { ListingCategory } from "@/lib/types";
import { CategoryCard } from "./category-card";
import { LISTING_CATEGORY_ICONS } from "./category-icons";

export function CategoryRail({ active = "all" }: { active?: ListingCategory | "all" }) {
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-3 md:mx-0 md:px-0">
      <CategoryCard href="/marketplace" label="All" icon={LISTING_CATEGORY_ICONS.all} active={active === "all"} />
      {LISTING_CATEGORIES.map((c) => (
        <CategoryCard
          key={c.id}
          href={`/marketplace/category/${c.id}`}
          label={c.label}
          icon={LISTING_CATEGORY_ICONS[c.id]}
          active={active === c.id}
        />
      ))}
      <CategoryCard href="/marketplace/search" label="More" icon={LISTING_CATEGORY_ICONS.more} />
    </nav>
  );
}
