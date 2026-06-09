import { createClient } from "@/utils/supabase/server";
import { Plus } from "lucide-react";
import { createProduct } from "../actions";
import { ActionButton } from "../ClientComponents";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('products').select('*');
  const productsList = products || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="p-8 md:p-12 border-b border-primary/20">
        <h2 className="text-5xl md:text-7xl font-serif leading-[0.8] tracking-tighter mb-4 text-primary">
          Product<br/><span className="italic text-accent">Manager.</span>
        </h2>
        <p className="text-primary/70 text-lg font-light">Control your bakery's menu.</p>
      </header>

      <section className="border-b border-primary/20">
        <div className="p-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between border-b border-primary/20 bg-surface/30 gap-6">
          <h3 className="text-3xl font-serif italic text-primary">Items List</h3>
          <span className="text-sm tracking-widest uppercase font-bold text-accent">{productsList.length} Items</span>
        </div>
        <div className="overflow-x-auto">
          <form id="create-product-form" action={createProduct}></form>
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-sm tracking-widest uppercase text-primary/50 border-b border-primary/20 bg-background/50">
                <th className="p-6 md:pl-12 font-medium">Product ID</th>
                <th className="p-6 font-medium">Product Name</th>
                <th className="p-6 font-medium">Taste Description</th>
                <th className="p-6 font-medium">Price (Rp)</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 md:pr-12 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-2 border-primary border-dashed bg-primary/5">
                <td className="p-6 md:pl-12 font-mono text-sm text-primary/40">NEW</td>
                <td className="p-6">
                  <input form="create-product-form" name="name" type="text" placeholder="Cookie Name" required className="bg-transparent border-b border-primary/40 p-2 outline-none font-serif text-xl focus:border-accent text-primary w-full" />
                </td>
                <td className="p-6">
                  <textarea form="create-product-form" name="taste_description" placeholder="Describe the flavor profile..." className="bg-transparent border border-primary/20 p-2 outline-none font-sans text-sm focus:border-accent text-primary w-full min-h-[60px]" />
                </td>
                <td className="p-6">
                  <input form="create-product-form" name="price" type="number" placeholder="Price" required className="bg-transparent border-b border-primary/40 p-2 outline-none font-serif text-xl focus:border-accent text-primary w-32" />
                </td>
                <td className="p-6">
                  <span className="inline-block px-3 py-1 text-xs tracking-widest uppercase border border-primary/30 text-primary/50 bg-background/50">DRAFT</span>
                </td>
                <td className="p-6 md:pr-12 text-right">
                  <button form="create-product-form" type="submit" className="text-sm tracking-widest uppercase font-bold text-background bg-primary px-4 py-2 hover:bg-accent transition-colors">+ Add</button>
                </td>
              </tr>
              {productsList.map(product => (
                <tr key={product.id} className="border-b border-primary/10 last:border-0 hover:bg-surface/50 transition-colors group">
                  <td className="p-6 md:pl-12 font-mono text-sm text-primary/80">{product.id.split('-')[1] || product.id.slice(0, 8)}</td>
                  <td className="p-6 font-serif text-xl">{product.name}</td>
                  <td className="p-6 text-sm text-primary/60 max-w-xs">{product.taste_description || '-'}</td>
                  <td className="p-6 text-primary/70 font-mono">{product.price.toLocaleString('id-ID')}</td>
                  <td className="p-6">
                    <ActionButton id={product.id} actionType="toggle_product" currentStatus={product.is_active} />
                  </td>
                  <td className="p-6 md:pr-12 text-right">
                    <ActionButton id={product.id} actionType="delete_product" />
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
