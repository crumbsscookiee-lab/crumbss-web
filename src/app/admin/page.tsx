import { Plus, LogOut, ArrowRight, TrendingUp, BarChart3, PieChart as PieIcon } from "lucide-react";
import { logout } from "./actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { DailyTrendChart, TopProductsChart, FinancialPieChart } from "./DashboardCharts";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const { data: expenses } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
  const { data: manualIncomes } = await supabase.from('manual_incomes').select('*').order('created_at', { ascending: false });
  const { data: products } = await supabase.from('products').select('*');

  const confirmedOrders = (allOrders || []).filter(o => o.status === 'confirmed' || o.status === 'done');
  
  const totalAutoIncome = confirmedOrders.reduce((acc, o) => acc + o.total_price, 0);
  const totalManualIncome = (manualIncomes || []).reduce((acc, inc) => acc + inc.amount, 0);
  const totalIncome = totalAutoIncome + totalManualIncome;
  const totalExpense = (expenses || []).reduce((acc, e) => acc + e.amount, 0);
  const profit = totalIncome - totalExpense;

  // Data Processing for Charts
  
  // 1. Weekly Trend (Last 12 Weeks)
  const weeklyTrendData: any[] = [];
  const now = new Date();
  
  // Create last 12 weeks slots
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - (i * 7));
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    const weekLabel = monday.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = new Date(monday);
    weekEnd.setDate(monday.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const orderIncome = confirmedOrders
      .filter(o => {
        const orderDate = o.created_at.split('T')[0];
        return orderDate >= weekStart && orderDate <= weekEndStr;
      })
      .reduce((acc, o) => acc + o.total_price, 0);

    const manualInc = (manualIncomes || [])
      .filter(inc => {
        const incDate = inc.created_at.split('T')[0];
        return incDate >= weekStart && incDate <= weekEndStr;
      })
      .reduce((acc, inc) => acc + inc.amount, 0);

    weeklyTrendData.push({
      date: weekLabel,
      income: orderIncome + manualInc
    });
  }

  // 2. Top Products
  const productSales: Record<string, number> = {};
  confirmedOrders.forEach(order => {
    order.items.forEach((item: any) => {
      const productId = item.productId || item.product_id;
      const qty = item.qty || item.quantity || 0;
      productSales[productId] = (productSales[productId] || 0) + qty;
    });
  });

  const topProductsData = Object.entries(productSales)
    .map(([id, sales]) => {
      const p = (products || []).find(prod => prod.id === id);
      return { name: p?.name || 'Unknown', sales };
    })
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // 3. Financial Comparison
  const financialData = [
    { name: 'Auto Income', value: totalAutoIncome },
    { name: 'Manual Income', value: totalManualIncome },
    { name: 'Expenses', value: totalExpense },
  ];

  // 4. Calculate Max Growth
  let maxGrowth = 0;
  let maxGrowthWeek = "";
  
  for (let i = 1; i < weeklyTrendData.length; i++) {
    const prev = weeklyTrendData[i - 1].income;
    const curr = weeklyTrendData[i].income;
    if (prev > 0) {
      const growth = ((curr - prev) / prev) * 100;
      if (growth > maxGrowth) {
        maxGrowth = growth;
        maxGrowthWeek = weeklyTrendData[i].date;
      }
    } else if (prev === 0 && curr > 0) {
      if (100 > maxGrowth) {
        maxGrowth = 100;
        maxGrowthWeek = weeklyTrendData[i].date;
      }
    }
  }

  const forceSync = async () => {
    'use server';
    revalidatePath('/admin');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 bg-surface/20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 p-8 md:p-12 border-b border-primary/20 bg-background">
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

      {/* Financial Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 border-b border-primary/20 bg-background">
        <div className="p-8 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-between bg-accent/5 hover:bg-accent/10 transition-colors">
          <p className="text-sm tracking-widest uppercase text-accent font-bold mb-8">Total Omset</p>
          <p className="text-4xl font-serif text-primary">Rp {totalIncome.toLocaleString('id-ID')}</p>
          <p className="text-xs text-primary/40 mt-4">*Gross revenue from all sources.</p>
        </div>

        <div className="p-8 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-between hover:bg-surface/50 transition-colors">
          <p className="text-sm tracking-widest uppercase text-primary/60 mb-8">Income (Auto)</p>
          <p className="text-4xl font-serif text-primary/80">Rp {totalAutoIncome.toLocaleString('id-ID')}</p>
          <p className="text-xs text-primary/40 mt-4">*From confirmed orders.</p>
        </div>

        <div className="p-8 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-between hover:bg-surface/50 transition-colors group relative">
          <Link href="/admin/incomes" className="absolute inset-0 z-10" />
          <p className="text-sm tracking-widest uppercase text-primary/60 mb-8">Income (Manual)</p>
          <p className="text-4xl font-serif text-primary/80 mb-6">Rp {totalManualIncome.toLocaleString('id-ID')}</p>
          <span className="text-xs font-bold tracking-widest uppercase text-accent group-hover:underline flex items-center gap-2">Manage <ArrowRight size={14} /></span>
        </div>
        
        <div className="p-8 border-b md:border-b-0 md:border-r border-primary/20 flex flex-col justify-between hover:bg-surface/50 transition-colors group relative">
          <Link href="/admin/expenses" className="absolute inset-0 z-10" />
          <p className="text-sm tracking-widest uppercase text-primary/60 mb-8">Expenses</p>
          <p className="text-4xl font-serif text-danger mb-6">Rp {totalExpense.toLocaleString('id-ID')}</p>
          <span className="text-xs font-bold tracking-widest uppercase text-accent group-hover:underline flex items-center gap-2">Manage <ArrowRight size={14} /></span>
        </div>
        
        <div className="p-8 bg-primary text-background flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/40 transition-colors duration-700" />
          <p className="text-sm tracking-widest uppercase text-background/60 mb-8 relative z-10">Net Profit</p>
          <p className="text-4xl font-serif text-accent relative z-10">Rp {profit.toLocaleString('id-ID')}</p>
          <p className="text-xs text-background/40 mt-4 relative z-10">*Calculated net earnings.</p>
        </div>

        <div className="p-8 border-b md:border-b-0 border-primary/20 flex flex-col justify-between hover:bg-surface/50 transition-colors group relative bg-accent/5">
          <Link href="/admin/analysis" className="absolute inset-0 z-10" />
          <p className="text-sm tracking-widest uppercase text-accent font-bold mb-8">Growth Analysis</p>
          <p className="text-4xl font-serif text-primary mb-6 flex items-center gap-2">Stats <TrendingUp size={24} /></p>
          <span className="text-xs font-bold tracking-widest uppercase text-accent group-hover:underline flex items-center gap-2">View Trends <ArrowRight size={14} /></span>
        </div>
      </section>

      {/* Visual Analytics Section */}
      <section className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-background border border-primary/20 p-8 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3 text-primary">
              <TrendingUp size={20} className="text-accent" />
              <h3 className="text-2xl font-serif italic">Weekly Income Trend</h3>
            </div>
            <div className="flex items-center gap-4">
              {maxGrowth > 0 && (
                <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 border border-accent/20">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60">Peak Growth</span>
                  <span className="text-xs font-bold text-green-600">+{maxGrowth.toFixed(1)}%</span>
                  <span className="text-[10px] tracking-widest uppercase text-primary/60">({maxGrowthWeek})</span>
                </div>
              )}
              <span className="text-xs tracking-widest uppercase text-primary/40 font-bold hidden md:block">Last 12 Weeks</span>
            </div>
          </div>
          <DailyTrendChart data={weeklyTrendData} />
        </div>

        {/* Financial Comparison */}
        <div className="bg-background border border-primary/20 p-8 shadow-sm">
          <div className="flex items-center gap-3 text-primary mb-8">
            <PieIcon size={20} className="text-accent" />
            <h3 className="text-2xl font-serif italic">Money Flow</h3>
          </div>
          <FinancialPieChart data={financialData} />
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-3 bg-background border border-primary/20 p-8 shadow-sm">
          <div className="flex items-center gap-3 text-primary mb-8">
            <BarChart3 size={20} className="text-accent" />
            <h3 className="text-2xl font-serif italic">Top Selling Products</h3>
          </div>
          <TopProductsChart data={topProductsData} />
        </div>
      </section>
    </div>
  );
}
