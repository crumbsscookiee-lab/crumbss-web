import { createClient } from "@/utils/supabase/server";
import { addManualIncome } from "../actions";
import { ActionButton } from "../ClientComponents";

export default async function ManualIncomesPage() {
  const supabase = await createClient();
  const { data: manualIncomes } = await supabase.from('manual_incomes').select('*').order('created_at', { ascending: false });
  const incomesList = manualIncomes || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="p-8 md:p-12 border-b border-primary/20">
        <h2 className="text-5xl md:text-7xl font-serif leading-[0.8] tracking-tighter mb-4 text-primary">
          Income<br/><span className="italic text-accent">Tracker.</span>
        </h2>
        <p className="text-primary/70 text-lg font-light">Manage your manual incoming funds.</p>
      </header>

      <section className="border-b border-primary/20">
        <div className="p-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between border-b border-primary/20 bg-surface/30 gap-6">
          <h3 className="text-3xl font-serif italic text-primary">Manual Incomes List</h3>
          <span className="text-sm tracking-widest uppercase font-bold text-accent">{incomesList.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <form id="add-income-form" action={addManualIncome}></form>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-sm tracking-widest uppercase text-primary/50 border-b border-primary/20 bg-background/50">
                <th className="p-6 md:pl-12 font-medium">Record ID</th>
                <th className="p-6 font-medium">Date</th>
                <th className="p-6 font-medium">Amount (Rp)</th>
                <th className="p-6 font-medium">Note</th>
                <th className="p-6 md:pr-12 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Quick Create Row */}
              <tr className="border-b-2 border-primary border-dashed bg-primary/5">
                <td className="p-6 md:pl-12 font-mono text-sm text-primary/40">NEW</td>
                <td className="p-6 font-serif italic text-primary/50">Today</td>
                <td className="p-6">
                  <input form="add-income-form" name="amount" type="number" placeholder="Rp Amount" required className="bg-transparent border-b border-primary/40 p-2 outline-none font-serif text-xl focus:border-accent text-primary w-32" />
                </td>
                <td className="p-6">
                  <input form="add-income-form" name="note" type="text" placeholder="Custom order, extra tip..." required className="bg-transparent border-b border-primary/40 p-2 outline-none font-serif text-xl focus:border-accent text-primary w-full" />
                </td>
                <td className="p-6 md:pr-12 text-right">
                  <button form="add-income-form" type="submit" className="text-sm tracking-widest uppercase font-bold text-background bg-primary px-4 py-2 hover:bg-accent transition-colors">+ Add</button>
                </td>
              </tr>
              {/* Existing Incomes */}
              {incomesList.map(inc => (
                <tr key={inc.id} className="border-b border-primary/10 last:border-0 hover:bg-surface/50 transition-colors group">
                  <td className="p-6 md:pl-12 font-mono text-sm text-primary/80">{inc.id.split('-')[1] || inc.id.slice(0, 8)}</td>
                  <td className="p-6 font-serif text-sm">{new Date(inc.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-6 text-accent font-mono">{inc.amount.toLocaleString('id-ID')}</td>
                  <td className="p-6 text-primary/70">{inc.note}</td>
                  <td className="p-6 md:pr-12 text-right">
                    <ActionButton id={inc.id} actionType="delete_manual_income" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
