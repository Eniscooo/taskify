import {
  Brush,
  Car,
  Hammer,
  LayoutGrid,
  MoreHorizontal,
  Shirt,
  Smartphone,
  Snowflake,
  Sofa,
  Sparkles,
  Truck,
  Tv,
  Wrench,
  Zap,
  Home,
  Cog,
  type LucideIcon,
} from "lucide-react";
import type { ListingCategory, ServiceCategory } from "@/lib/types";

export const LISTING_CATEGORY_ICONS: Record<ListingCategory | "all" | "more", LucideIcon> = {
  all: LayoutGrid,
  phones: Smartphone,
  electronics: Tv,
  furniture: Sofa,
  fashion: Shirt,
  vehicles: Car,
  home: Home,
  more: MoreHorizontal,
};

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategory | "more", LucideIcon> = {
  plumbing: Wrench,
  cleaning: Sparkles,
  electrical: Zap,
  moving: Truck,
  "ac-repair": Snowflake,
  painting: Brush,
  carpentry: Hammer,
  "generator-repair": Cog,
  more: MoreHorizontal,
};
