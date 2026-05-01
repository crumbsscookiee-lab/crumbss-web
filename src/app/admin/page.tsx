import { Plus, LogOut, ArrowRight } from "lucide-react";
import { logout } from "./actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const { data: expenses } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });

  const totalIncome = (allOrders || []).filter(o => o.status === 'confirmed' || o.status === 'done').reduce((acc, o) => acc + o.total_price, 0);
  const totalExpense = (expenses || []).reduce((acc, e) => acc + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const forceSync = async () => {
    'use server';
    revalidatePath('/admin');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 p-8 md:p-12 border-b border-primary/20">
        <div>
          <h2 className="text-5xl md:text-7xl font-serif leading-[0.8] tracking-tighter mb-4 text-primary">
            System<br/><span className="italic text-accent">Overview.</span>
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-primary/70 text-lg font-light">Welcome back. The oven awaits your command.</p>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-2 text-sm tracking-widest uppercase font-bold text-danger border-b border-transparent hover:border-danger transition-all pb-0.5">
                <LogOut size={14} /> Sign Out
              </button>
            </form>
          </div>
        </div>
        <form action={forceSync}>
          <button type="submit" className="group flex items-center gap-3 px-6 py-4 bg-primary text-background hover:bg-accent transition-colors font-serif italic text-xl border border-primary shadow-lg">
            Force Sync Data <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          </button>
        </form>
      </header>

      {/* Financial Tracker */}
      <section className="grid grid-cols-1 md:grid-cols-3 border-b border-primary/20">
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-between hover:bg-surface/50 transition-colors">
          <div className="flex justify-between items-start mb-8">
            <p className="text-sm tracking-widest uppercase text-primary/60">Income (Auto)</p>
          </div>
          <p className="text-4xl md:text-5xl font-serif text-primary">Rp {totalIncome.toLocaleString('id-ID')}</p>
          <p className="text-sm text-primary/40 mt-4">*Calculated from 'Confirmed' and 'Picked Up' orders.</p>
        </div>
        
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-between hover:bg-surface/50 transition-colors group relative">
          <Link href="/admin/expenses" className="absolute inset-0 z-10" />
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4 border-b border-primary/10 pb-6 relative z-20">
            <p className="text-sm tracking-widest uppercase text-primary/60 whitespace-nowrap">Expenses (Manual)</p>
          </div>
          <p className="text-4xl md:text-5xl font-serif text-danger mb-6">Rp {totalExpense.toLocaleString('id-ID')}</p>
          <div className="mt-auto">
            <span className="text-sm font-bold tracking-widest uppercase text-accent group-hover:underline flex items-center gap-2">Manage Expenses <ArrowRight size={16} /></span>
          </div>
        </div>
        
        <div className="p-8 md:p-12 bg-primary text-background flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/40 transition-colors duration-700" />
          <p className="text-sm tracking-widest uppercase text-background/60 mb-8 relative z-10">Net Profit (Calc)</p>
          <p className="text-4xl md:text-5xl font-serif text-accent relative z-10">Rp {profit.toLocaleString('id-ID')}</p>
        </div>
      </section>
    </div>
  );
}
