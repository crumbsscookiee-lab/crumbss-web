import { createClient } from "@/utils/supabase/server";
import { createBatch } from "../actions";
import { BatchToggleButton, ActionButton } from "../ClientComponents";

export default async function BatchesPage() {
  const supabase = await createClient();
  const { data: batches } = await supabase.from('batches').select('*').order('batch_date', { ascending: false });
  const batchesList = batches || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="p-8 md:p-12 border-b border-primary/20">
        <h2 className="text-5xl md:text-7xl font-serif leading-[0.8] tracking-tighter mb-4 text-primary">
          Batch<br/><span className="italic text-accent">Controller.</span>
        </h2>
        <p className="text-primary/70 text-lg font-light">Open and close pre-orders here.</p>
      </header>

      <section className="border-b border-primary/20">
        <div className="p-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between border-b border-primary/20 bg-surface/30 gap-6">
          <h3 className="text-3xl font-serif italic text-primary">PO Records</h3>
          <span className="text-sm tracking-widest uppercase font-bold text-accent">{batchesList.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <form id="create-batch-form" action={createBatch}></form>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-sm tracking-widest uppercase text-primary/50 border-b border-primary/20 bg-background/50">
                <th className="p-6 md:pl-12 font-medium">Batch ID</th>
                <th className="p-6 font-medium">Batch Date</th>
                <th className="p-6 font-medium">Global Quota</th>
                <th className="p-6 font-medium">Toggle PO</th>
                <th className="p-6 md:pr-12 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-2 border-primary border-dashed bg-primary/5">
                <td className="p-6 md:pl-12 font-mono text-sm text-primary/40">NEW</td>
                <td className="p-6">
                  <input form="create-batch-form" name="batch_date" type="date" required className="bg-transparent border-b border-primary/40 p-2 outline-none font-serif text-xl focus:border-accent text-primary w-full" />
                </td>
                <td className="p-6">
                  <input form="create-batch-form" name="quota" type="number" placeholder="Qty" required className="bg-transparent border-b border-primary/40 p-2 outline-none font-serif text-xl focus:border-accent text-primary w-24" />
                </td>
                <td className="p-6">
                  <span className="inline-block px-3 py-1 text-xs tracking-widest uppercase border border-primary/30 text-primary/50 bg-background/50">DRAFT</span>
                </td>
                <td className="p-6 md:pr-12 text-right">
                  <button form="create-batch-form" type="submit" className="text-sm tracking-widest uppercase font-bold text-background bg-primary px-4 py-2 hover:bg-accent transition-colors">+ Create</button>
                </td>
              </tr>
              {batchesList.map(batch => (
                <tr key={batch.id} className="border-b border-primary/10 last:border-0 hover:bg-surface/50 transition-colors group">
                  <td className="p-6 md:pl-12 font-mono text-sm text-primary/80">{batch.id}</td>
                  <td className="p-6 font-serif text-xl">{batch.batch_date}</td>
                  <td className="p-6 text-primary/70 font-mono">{batch.quota}</td>
                  <td className="p-6">
                    <BatchToggleButton id={batch.id} isOpen={batch.is_open} />
                  </td>
                  <td className="p-6 md:pr-12 text-right">
                    <ActionButton id={batch.id} actionType="delete_batch" />
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
