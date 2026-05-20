'use client';

import { useState } from 'react';
import { Product, Batch } from '@/lib/api';
import { ArrowRight, Upload, Download } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function OrderForm({ products, activeBatch }: { products: Product[], activeBatch: Batch | undefined }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    wa: '',
    instagram: '',
    deliveryMethod: 'Pickup',
    address: '',
    paymentMethod: 'QRIS',
  });
  const [selectedItems, setSelectedItems] = useState<{ productId: string, qty: number }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!activeBatch) {
    return (
      <section className="py-32 px-6 md:px-12 bg-primary text-background relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h3 className="text-6xl md:text-8xl font-serif italic mb-8">Closed.</h3>
          <p className="text-background/70 text-2xl font-light mb-12">The oven is resting. Check Instagram for the next drop.</p>
          <a href="https://wa.me/62895418600555" className="text-accent hover:text-background font-serif italic text-2xl border-b border-accent hover:border-background transition-all pb-1">
            Notify me via WhatsApp
          </a>
        </div>
      </section>
    );
  }

  const totalPrice = selectedItems.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? product.price * item.qty : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert('Please select at least 1 menu item.');
    if (formData.paymentMethod === 'QRIS' && !file) return alert('Please upload your payment proof.');
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      let proofUrl = '';

      // Handle File Compression & Upload
      if (file && formData.paymentMethod === 'QRIS') {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        
        const fileName = `${Date.now()}-${compressedFile.name.replace(/\s+/g, '-')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('transfer_proofs')
          .upload(`public/${fileName}`, compressedFile, {
            cacheControl: '3600',
            upsert: false,
          });
          
        if (uploadError) {
          console.error("Upload error details:", uploadError);
          throw new Error(`Gagal upload bukti transfer: ${uploadError.message}. Pastikan bucket 'transfer_proofs' telah dibuat menjadi public.`);
        }
        
        const { data: publicUrlData } = supabase.storage.from('transfer_proofs').getPublicUrl(`public/${fileName}`);
        proofUrl = publicUrlData.publicUrl;
      }

      // Decrement Quota based on total items ordered
      const totalQty = selectedItems.reduce((acc, item) => acc + item.qty, 0);
      const { data: currentBatch } = await supabase.from('batches').select('quota, menus').eq('id', activeBatch.id).single();
      
      let updatedMenus = { ...(currentBatch?.menus || {}) };
      let hasError = false;
      let errorMsg = '';

      if (currentBatch?.menus && Object.keys(currentBatch.menus).length > 0) {
        for (const item of selectedItems) {
          const currentQ = updatedMenus[item.productId] || 0;
          if (currentQ < item.qty) {
            const p = products.find(p => p.id === item.productId);
            hasError = true;
            errorMsg = `Pemesanan ditolak: Sisa kuota untuk ${p?.name} hanya ${currentQ}, namun Anda memesan ${item.qty}.`;
            break;
          }
          updatedMenus[item.productId] = currentQ - item.qty;
        }
      } else {
        // Fallback to global quota
        if (!currentBatch || currentBatch.quota < totalQty) {
          hasError = true;
          errorMsg = `Pemesanan ditolak: Sisa kuota hanya ${currentBatch?.quota || 0} item, namun Anda memesan ${totalQty} item.`;
        }
      }

      if (hasError) throw new Error(errorMsg);

      const { error: batchUpdateError } = await supabase.from('batches').update({ 
        quota: (currentBatch?.quota || 0) - totalQty, 
        menus: updatedMenus 
      }).eq('id', activeBatch.id);

      if (batchUpdateError) {
        console.error("Failed to update batch quota:", batchUpdateError);
        throw new Error("Gagal mengupdate kuota. Pastikan RLS Supabase mengizinkan public UPDATE pada tabel batches.");
      }

      // Insert Order to DB
      const { error: insertError } = await supabase.from('orders').insert([{
        customer_name: formData.name,
        wa_number: formData.wa,
        instagram: formData.instagram,
        batch_id: activeBatch.id,
        items: selectedItems,
        total_price: totalPrice,
        payment_method: formData.paymentMethod,
        delivery_address: formData.deliveryMethod === 'Delivery' ? formData.address : null,
        proof_url: proofUrl || null,
        status: 'pending'
      }]);

      if (insertError) throw insertError;

      // WhatsApp Redirect
      setSuccess(true);
      const message = `Halo Crumbss! Saya ingin order PO Batch ${activeBatch.batch_date}:\n\nNama: ${formData.name}\nPesanan:\n${selectedItems.map(item => {
        const p = products.find(prod => prod.id === item.productId);
        return `- ${item.qty}x ${p?.name}`;
      }).join('\n')}\n\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}\nMetode: ${formData.deliveryMethod} - ${formData.paymentMethod}\n\nTerima kasih!`;
      
      window.open(`https://wa.me/62895418600555?text=${encodeURIComponent(message)}`, '_blank');
      router.refresh();

    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="py-32 px-6 md:px-12 bg-primary text-background relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-6xl md:text-8xl font-serif mb-8 text-background">Recorded.</h3>
          <p className="text-background/70 text-2xl font-light mb-12">Redirecting to WhatsApp for confirmation.</p>
          <button onClick={() => { setSuccess(false); setFile(null); }} className="text-accent font-serif italic text-xl border-b border-accent pb-1 hover:text-background hover:border-background transition-all">
            Start a new order
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 md:px-12 relative z-10 bg-primary text-background selection:bg-accent selection:text-background" id="order-form">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row justify-between items-end border-b border-background/20 pb-8 gap-8">
          <h2 className="text-6xl md:text-8xl font-serif tracking-tighter leading-[0.8] text-background">
            Order<br/><span className="italic text-accent">Form.</span>
          </h2>
          <div className="text-right">
            <p className="text-sm tracking-widest uppercase text-background/50 mb-2">Current Batch</p>
            <p className="text-2xl font-serif italic text-background">{activeBatch.batch_date}</p>
            <p className="text-sm font-light mt-1 text-background/70">Quota remaining: {activeBatch.quota}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-24">
          {/* Section 01 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16">
            <div className="md:col-span-1 border-t border-background/20 pt-4">
              <span className="text-xl font-serif text-accent/80 italic">01</span>
              <h3 className="text-2xl font-serif mt-2">Details</h3>
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="space-y-3 relative">
                <label className="text-sm tracking-widest uppercase text-background/60">Full Name</label>
                <input required type="text" className="w-full bg-background/5 border-b-2 border-background/20 focus:border-accent py-4 px-4 outline-none transition-colors text-xl font-serif focus:bg-background/10" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
              </div>
              <div className="space-y-3 relative">
                <label className="text-sm tracking-widest uppercase text-background/60">WhatsApp</label>
                <input required type="tel" className="w-full bg-background/5 border-b-2 border-background/20 focus:border-accent py-4 px-4 outline-none transition-colors text-xl font-serif focus:bg-background/10" value={formData.wa} onChange={e => setFormData({...formData, wa: e.target.value})} placeholder="08..." />
              </div>
              <div className="space-y-3 md:col-span-2 relative">
                <label className="text-sm tracking-widest uppercase text-background/60">Instagram (Optional)</label>
                <input type="text" className="w-full bg-background/5 border-b-2 border-background/20 focus:border-accent py-4 px-4 outline-none transition-colors text-xl font-serif focus:bg-background/10" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} placeholder="@username" />
              </div>
            </div>
          </div>

          {/* Section 02 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16">
            <div className="md:col-span-1 border-t border-background/20 pt-4">
              <span className="text-xl font-serif text-accent/80 italic">02</span>
              <h3 className="text-2xl font-serif mt-2">Selection</h3>
            </div>
            <div className="md:col-span-3 flex flex-col gap-4">
              {products
                .filter(p => !activeBatch.menus || Object.keys(activeBatch.menus).length === 0 || p.id in activeBatch.menus)
                .map(product => {
                  const sisa = activeBatch.menus && product.id in activeBatch.menus 
                    ? activeBatch.menus[product.id] 
                    : undefined;
                  const currentQty = selectedItems.find(i => i.productId === product.id)?.qty || 0;

                  return (
                    <div key={product.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 px-6 bg-background/5 border-l-2 border-transparent hover:border-accent hover:bg-background/10 transition-colors">
                      <div>
                        <p className="font-serif text-3xl mb-2">{product.name}</p>
                        <p className="text-background/60 font-light tracking-wider">
                          Rp {product.price.toLocaleString('id-ID')}
                          {sisa !== undefined && (
                            <span className="ml-4 text-accent text-sm bg-accent/10 px-2 py-1">
                              Sisa: {sisa}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 mt-4 sm:mt-0 bg-background/10 rounded-full px-2 py-1">
                        <button type="button" className="text-3xl hover:text-accent transition-colors px-4 pb-1" onClick={() => {
                          if(currentQty > 0) setSelectedItems(selectedItems.filter(i => i.productId !== product.id || currentQty > 1).map(i => i.productId === product.id ? {...i, qty: currentQty - 1} : i));
                        }}>-</button>
                        <span className="w-8 text-center font-serif text-2xl">{currentQty}</span>
                        <button type="button" className="text-3xl hover:text-accent transition-colors px-4 pb-1 disabled:opacity-50 disabled:hover:text-inherit" 
                          disabled={sisa !== undefined && currentQty >= sisa}
                          onClick={() => {
                          const exists = selectedItems.find(i => i.productId === product.id);
                          if(exists) setSelectedItems(selectedItems.map(i => i.productId === product.id ? {...i, qty: currentQty + 1} : i));
                          else setSelectedItems([...selectedItems, { productId: product.id, qty: 1 }]);
                        }}>+</button>
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>

          {/* Section 03 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16">
            <div className="md:col-span-1 border-t border-background/20 pt-4">
              <span className="text-xl font-serif text-accent/80 italic">03</span>
              <h3 className="text-2xl font-serif mt-2">Delivery & Pay</h3>
            </div>
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              <div className="space-y-3">
                <label className="text-sm tracking-widest uppercase text-background/60">Method</label>
                <select className="w-full bg-background/5 border-b-2 border-background/20 focus:border-accent py-4 px-4 outline-none transition-colors text-xl font-serif appearance-none rounded-none focus:bg-background/10 text-background" value={formData.deliveryMethod} onChange={e => setFormData({...formData, deliveryMethod: e.target.value})}>
                  <option value="Pickup" className="text-primary">Pickup</option>
                  <option value="Delivery" className="text-primary">Delivery Courier</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm tracking-widest uppercase text-background/60">Payment</label>
                <select className="w-full bg-background/5 border-b-2 border-background/20 focus:border-accent py-4 px-4 outline-none transition-colors text-xl font-serif appearance-none rounded-none focus:bg-background/10 text-background" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                  <option value="QRIS" className="text-primary">QRIS</option>
                  <option value="COD" className="text-primary">Cash on Delivery</option>
                </select>
              </div>
              
              {formData.deliveryMethod === 'Delivery' && (
                <div className="space-y-3 md:col-span-2">
                  <label className="text-sm tracking-widest uppercase text-background/60">Full Address</label>
                  <textarea required className="w-full bg-background/5 border-b-2 border-background/20 focus:border-accent py-4 px-4 outline-none transition-colors text-xl font-serif min-h-[120px] resize-none focus:bg-background/10 text-background" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City, Details..." />
                </div>
              )}

              {formData.paymentMethod === 'QRIS' && (
                <div className="md:col-span-2 border border-background/20 bg-background/5 p-8 mt-4">
                  <p className="text-sm tracking-widest uppercase text-background/60 mb-4">QRIS Payment</p>
                  <div className="mb-8 max-w-[250px]">
                    {/* Placeholder for QRIS. You can replace /qris.jpg with your actual file path later */}
                    <img src="/qris.jpeg" alt="QRIS Code" className="w-full h-auto rounded-xl shadow-lg border border-background/20" />
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xl font-light italic text-accent">Crumbss Bakery</p>
                      <a href="/qris.jpeg" download="QRIS-Crumbss-Bakery.jpeg" className="flex items-center gap-2 text-sm bg-accent/20 hover:bg-accent hover:text-background transition-colors text-accent px-4 py-2 rounded-full cursor-pointer">
                        <Download size={16} />
                        <span>Simpan QRIS</span>
                      </a>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-sm tracking-widest uppercase text-background/60 block">Upload Payment Proof</label>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        required
                      />
                      <div className={`border-2 border-dashed ${file ? 'border-accent bg-accent/10' : 'border-background/30 hover:border-accent'} p-6 text-center transition-colors flex flex-col items-center justify-center`}>
                        <Upload size={24} className={file ? 'text-accent mb-2' : 'text-background/40 mb-2'} />
                        <p className={`font-serif text-lg ${file ? 'text-accent' : 'text-background/70'}`}>
                          {file ? file.name : 'Click or drag image here'}
                        </p>
                        <p className="text-xs tracking-widest uppercase text-background/40 mt-2">Max 5MB (Auto-compressed)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-background/30 mt-16 pt-12 flex flex-col md:flex-row items-end justify-between gap-8">
            <div>
              <p className="text-sm tracking-widest uppercase text-background/60 mb-2">Total</p>
              <p className="text-5xl md:text-7xl font-serif text-accent">Rp {totalPrice.toLocaleString('id-ID')}</p>
            </div>
            <button disabled={isSubmitting || totalPrice === 0 || activeBatch.quota <= 0} type="submit" className="group flex items-center justify-between gap-4 w-full md:w-auto bg-background text-primary hover:bg-accent hover:text-background transition-colors duration-500 py-6 px-12 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl">
              <span className="font-serif text-2xl italic">{isSubmitting ? 'Processing...' : activeBatch.quota <= 0 ? 'Quota Full' : 'Submit Order'}</span>
              {!isSubmitting && activeBatch.quota > 0 && <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
