import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { getCurrentUser, getUnreadCounts } from "@/lib/api";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const [counts, user] = await Promise.all([getUnreadCounts(), getCurrentUser()]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <DesktopNav counts={counts} userName={user.name} />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-6 md:pt-6 md:pb-12">
        {children}
      </main>
      <BottomNav counts={counts} />
    </>
  );
}
