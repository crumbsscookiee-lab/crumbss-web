import { createClient } from "@/utils/supabase/server";
import { OrderFilters, OrderStatusSelect, ActionButton } from "../ClientComponents";

export default async function OrdersPage(props: { searchParams: Promise<{ batch?: string, method?: string }> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  const { data: allOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const { data: products } = await supabase.from('products').select('*');
  const { data: batches } = await supabase.from('batches').select('*').order('batch_date', { ascending: false });

  let filteredOrders = allOrders || [];
  if (searchParams.batch) filteredOrders = filteredOrders.filter(o => o.batch_id === searchParams.batch);
  if (searchParams.method) filteredOrders = filteredOrders.filter(o => o.payment_method === searchParams.method);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="p-8 md:p-12 border-b border-primary/20">
        <h2 className="text-5xl md:text-7xl font-serif leading-[0.8] tracking-tighter mb-4 text-primary">
          Order<br/><span className="italic text-accent">Manager.</span>
        </h2>
        <p className="text-primary/70 text-lg font-light">Track and update customer orders.</p>
      </header>

      <section>
        <div className="p-8 md:px-12 flex flex-col md:flex-row md:items-center justify-between border-b border-primary/20 bg-surface/30 gap-6">
          <h3 className="text-3xl font-serif italic text-primary">Orders List</h3>
          
          <div className="flex flex-wrap items-center gap-4">
            <OrderFilters batches={batches || []} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-24 border-b border-primary/20">
              <h4 className="text-4xl font-serif italic text-primary/30 mb-4">No records found.</h4>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="text-sm tracking-widest uppercase text-primary/50 border-b border-primary/20 bg-background/50">
                  <th className="p-6 md:pl-12 font-medium">ID</th>
                  <th className="p-6 font-medium">Customer & Order Details</th>
                  <th className="p-6 font-medium">Method</th>
                  <th className="p-6 font-medium">Total</th>
                  <th className="p-6 font-medium">Transfer Proof</th>
                  <th className="p-6 font-medium">Status</th>
                  <th className="p-6 md:pr-12 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  let mappedStatus = order.status;
                  if (mappedStatus === 'done') mappedStatus = 'Picked Up/Delivered';
                  if (mappedStatus === 'pending') mappedStatus = 'Pending';
                  
                  return (
                    <tr key={order.id} className="border-b border-primary/10 last:border-0 hover:bg-surface/50 transition-colors group">
                      <td className="p-6 md:pl-12 font-mono text-xs text-primary/80">{order.id.split('-')[1] || order.id.slice(0, 8)}</td>
                      <td className="p-6">
                        <div className="font-serif text-xl">{order.customer_name}</div>
                        <div className="text-xs font-mono text-primary/50 mt-1">{order.wa_number}</div>
                        <div className="mt-4 space-y-1 bg-background/30 p-3 border border-primary/10">
                          {order.items.map((item: any, i: number) => {
                            const p = (products || []).find(prod => prod.id === item.productId || prod.id === item.product_id);
                            return (
                              <p key={i} className="text-sm text-primary/80">
                                <span className="font-bold text-primary mr-2">{item.qty || item.quantity}x</span> 
                                {p?.name || 'Unknown Item'}
                              </p>
                            )
                          })}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="text-sm tracking-widest uppercase text-primary/80">{order.payment_method}</div>
                        <div className="text-xs text-primary/50 mt-1">{order.delivery_address ? 'Delivery' : 'Pickup'}</div>
                      </td>
                      <td className="p-6 font-serif text-xl text-primary align-top">Rp {order.total_price.toLocaleString('id-ID')}</td>
                      <td className="p-6 align-top">
                        {order.payment_method === 'Transfer' && order.proof_url ? (
                          <a href={order.proof_url} target="_blank" rel="noopener noreferrer" className="text-accent underline text-sm italic font-serif hover:text-primary transition-colors">
                            View Image
                          </a>
                        ) : order.payment_method === 'Transfer' && !order.proof_url ? (
                          <span className="text-danger/50 text-sm italic font-serif">No Image Uploaded</span>
                        ) : (
                          <span className="text-primary/30 text-sm italic font-serif">N/A</span>
                        )}
                      </td>
                      <td className="p-6 align-top">
                        <span className={`inline-block px-3 py-1 text-[10px] sm:text-xs tracking-widest uppercase border ${
                          mappedStatus === 'Picked Up/Delivered' ? 'border-primary text-primary bg-primary/5' :
                          mappedStatus === 'Confirmed' || mappedStatus === 'confirmed' ? 'border-accent text-accent bg-accent/5' :
                          'border-danger/40 text-danger'
                        }`}>
                          {mappedStatus}
                        </span>
                      </td>
                      <td className="p-6 md:pr-12 text-right align-top flex flex-col items-end gap-3">
                        <OrderStatusSelect id={order.id} currentStatus={order.status} />
                        <ActionButton id={order.id} actionType="delete_order" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
