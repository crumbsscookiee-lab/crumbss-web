'use client';

import { useState, useEffect } from "react";
import { Cookie, LayoutDashboard, Settings, ShoppingBag, Calendar, Package, Receipt, Banknote, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
    { href: "/admin/batches", icon: Calendar, label: "Batches" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/expenses", icon: Receipt, label: "Expenses" },
    { href: "/admin/incomes", icon: Banknote, label: "Incomes" },
  ];

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-primary/20 bg-background/80 backdrop-blur-md sticky top-0 z-[60]">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-background">
            <Cookie size={18} />
          </div>
          <h1 className="font-bold font-serif text-xl italic leading-none">Crumbss.</h1>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-primary hover:bg-primary/10 transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-primary/20 flex flex-col transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:h-screen md:sticky md:top-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 border-b border-primary/20 hidden md:block">
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

        {/* Mobile Sidebar Top (when open) */}
        <div className="md:hidden p-8 border-b border-primary/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center text-background">
              <Cookie size={24} />
            </div>
            <h1 className="font-bold font-serif text-2xl italic leading-none">Crumbss.</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 text-primary">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col p-8 gap-4 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center gap-4 hover:text-accent font-serif text-2xl transition-colors group ${isActive ? 'text-accent' : 'text-primary'}`}
              >
                <Icon size={24} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`} />
                <span className="italic">{link.label}</span>
              </Link>
            );
          })}
          
          <Link href="/" className="flex items-center gap-4 text-primary/50 hover:text-primary font-serif text-2xl transition-colors group mt-auto pt-8 border-t border-primary/10">
            <Settings size={24} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="italic">Public Web</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
