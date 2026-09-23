import Sidebar from '@/components/Sidebar';

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Offset content by sidebar width on desktop, top bar on mobile */}
      <div className="md:pl-64 pt-14 md:pt-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-screen-xl">{children}</main>
      </div>
    </div>
  );
}
