import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SellForm } from "@/components/listings/sell/sell-form";

export const metadata: Metadata = { title: "Sell an item" };

export default function SellPage() {
  return (
    <>
      <PageHeader title="Sell an item" subtitle="Free to list · 5% fee only when it sells" backHref="/" className="md:mx-auto md:max-w-2xl" />
      <SellForm />
    </>
  );
}
