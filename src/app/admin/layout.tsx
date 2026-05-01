import { Cookie, LayoutDashboard, Settings, ShoppingBag, Calendar, Package, Receipt } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative z-10 selection:bg-primary selection:text-background">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r-0 md:border-r border-b md:border-b-0 border-primary/20 flex flex-col sticky top-0 md:h-screen bg-background/50 backdrop-blur-md">
        <div className="p-8 border-b border-primary/20">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary flex items-center justify-center text-background group-hover:bg-accent transition-colors">
              <Cookie size={28} />
            </div>
            <div>
              <h1 className="font-bold font-serif text-3xl leading-none italic">Crumbss.</h1>
              <p className="text-sm text-primary/60 tracking-widest uppercase mt-1">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col p-8 gap-4">
          <Link href="/admin" className="flex items-center gap-4 text-primary hover:text-accent font-serif text-2xl transition-colors group">
            <LayoutDashboard size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Overview</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-4 text-primary hover:text-accent font-serif text-2xl transition-colors group">
            <ShoppingBag size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Orders</span>
          </Link>
          <Link href="/admin/batches" className="flex items-center gap-4 text-primary hover:text-accent font-serif text-2xl transition-colors group">
            <Calendar size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Batches</span>
          </Link>
          <Link href="/admin/products" className="flex items-center gap-4 text-primary hover:text-accent font-serif text-2xl transition-colors group">
            <Package size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Products</span>
          </Link>
          <Link href="/admin/expenses" className="flex items-center gap-4 text-primary hover:text-accent font-serif text-2xl transition-colors group">
            <Receipt size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Expenses</span>
          </Link>
          <Link href="/" className="flex items-center gap-4 text-primary/50 hover:text-primary font-serif text-2xl transition-colors group mt-auto">
            <Settings size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Public Web</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
