import BottomNav from '@/components/BottomNav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--background)] overflow-x-hidden max-w-[480px] mx-auto">
      {/* Page Content */}
      <main className="pb-safe">
        {children}
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}
