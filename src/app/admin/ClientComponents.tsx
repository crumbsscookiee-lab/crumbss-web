'use client';

import { useTransition } from 'react';
import { toggleBatchStatus, updateOrderStatus } from './actions';

export function BatchToggleButton({ id, isOpen }: { id: string, isOpen: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button 
      onClick={() => startTransition(() => toggleBatchStatus(id, isOpen))}
      disabled={isPending}
      className={`inline-block px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors cursor-pointer ${
        isOpen 
          ? 'border-accent text-accent hover:bg-accent hover:text-background' 
          : 'border-danger/50 text-danger/70 hover:bg-danger hover:text-background'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      {isPending ? 'WAIT...' : isOpen ? 'OPEN (Disable)' : 'CLOSED (Enable)'}
    </button>
  );
}

export function OrderStatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select 
      value={currentStatus}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateOrderStatus(id, e.target.value))}
      className={`bg-transparent border-b border-primary/20 outline-none text-xs tracking-widest uppercase font-bold text-accent cursor-pointer hover:border-primary transition-colors ${isPending ? 'opacity-50' : ''}`}
    >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="done">Picked Up</option>
    </select>
  );
}

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export function BatchQuotaSelector({ products }: { products: {id: string, name: string}[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selections, setSelections] = useState<Record<string, { selected: boolean, quota: string }>>({});

  const handleCheckbox = (id: string, checked: boolean) => {
    setSelections(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { quota: '' }), selected: checked }
    }));
  };

  const handleQuota = (id: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { selected: false }), quota: value }
    }));
  };

  const activeCount = Object.values(selections).filter(s => s.selected && parseInt(s.quota) > 0).length;

  return (
    <>
      {products.map(p => {
        const s = selections[p.id];
        if (!s || !s.selected) return null;
        return (
          <div key={`hidden-${p.id}`} className="hidden">
            <input type="hidden" form="create-batch-form" name={`product_${p.id}`} value="on" />
            <input type="hidden" form="create-batch-form" name={`quota_${p.id}`} value={s.quota} />
          </div>
        );
      })}

      <button 
        type="button" 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-xs tracking-widest uppercase border border-primary/30 hover:border-accent hover:text-accent transition-colors w-full text-left flex justify-between items-center"
      >
        <span>{activeCount > 0 ? `${activeCount} Menus Set` : 'Set Menus'}</span>
        <span className="text-lg leading-none">+</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-background border border-primary/20 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 flex justify-between items-center border-b border-primary/20 bg-surface/30">
              <h3 className="text-2xl font-serif text-primary italic">Select Menus</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-primary/50 hover:text-danger transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              {products.map(p => {
                const s = selections[p.id] || { selected: false, quota: '' };
                return (
                  <label key={p.id} className="flex flex-col gap-3 p-4 border border-primary/10 hover:border-primary/30 bg-surface/10 hover:bg-surface/30 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <input 
                        type="checkbox" 
                        checked={s.selected}
                        onChange={(e) => handleCheckbox(p.id, e.target.checked)}
                        className="accent-accent w-5 h-5 mt-0.5 cursor-pointer" 
                      />
                      <span className="text-base text-primary/90 font-medium group-hover:text-primary transition-colors leading-tight">{p.name}</span>
                    </div>
                    <div className="pl-9">
                      <input 
                        type="number" 
                        placeholder="Quota Qty" 
                        value={s.quota}
                        onChange={(e) => handleQuota(p.id, e.target.value)}
                        className="bg-transparent border-b border-primary/30 p-1 outline-none font-mono text-sm focus:border-accent text-primary w-full max-w-[120px]" 
                      />
                    </div>
                  </label>
                );
              })}
              {products.length === 0 && <span className="text-sm text-primary/50">No active menus found.</span>}
            </div>
            <div className="p-6 border-t border-primary/20 bg-surface/30 flex justify-end">
              <button type="button" onClick={() => setIsOpen(false)} className="text-sm tracking-widest uppercase font-bold text-background bg-primary px-8 py-3 hover:bg-accent transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function OrderFilters({ batches }: { batches: { id: string, batch_date: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      <div className="flex items-center gap-2 border border-primary/20 bg-background px-3 py-2">
        <Filter size={16} className="text-primary/50" />
        <select 
          onChange={e => updateParam('batch', e.target.value)}
          defaultValue={searchParams.get('batch') || ''}
          className="bg-transparent text-sm tracking-widest uppercase text-primary/80 outline-none appearance-none font-bold pr-4"
        >
          <option value="">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batch_date}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 border border-primary/20 bg-background px-3 py-2">
        <Filter size={16} className="text-primary/50" />
        <select 
          onChange={e => updateParam('method', e.target.value)}
          defaultValue={searchParams.get('method') || ''}
          className="bg-transparent text-sm tracking-widest uppercase text-primary/80 outline-none appearance-none font-bold pr-4"
        >
          <option value="">All Methods</option>
          <option value="Transfer">Transfer</option>
          <option value="COD">COD</option>
        </select>
      </div>
    </>
  )
}

import { deleteBatch, deleteOrder, deleteExpense, deleteProduct, toggleProductActive, deleteManualIncome } from './actions';

export function ActionButton({ 
  id, actionType, currentStatus 
}: { 
  id: string, 
  actionType: 'delete_batch' | 'delete_order' | 'delete_expense' | 'delete_manual_income' | 'delete_product' | 'toggle_product',
  currentStatus?: boolean
}) {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    startTransition(() => {
      if (actionType === 'delete_batch') deleteBatch(id);
      if (actionType === 'delete_order') deleteOrder(id);
      if (actionType === 'delete_expense') deleteExpense(id);
      if (actionType === 'delete_manual_income') deleteManualIncome(id);
      if (actionType === 'delete_product') deleteProduct(id);
      if (actionType === 'toggle_product' && currentStatus !== undefined) toggleProductActive(id, currentStatus);
    });
  };

  if (actionType === 'toggle_product') {
    return (
      <button 
        onClick={handleAction} disabled={isPending}
        className={`inline-block px-4 py-1.5 text-xs tracking-widest uppercase border transition-colors cursor-pointer ${
          currentStatus 
            ? 'border-accent text-accent hover:bg-accent hover:text-background' 
            : 'border-primary/50 text-primary/70 hover:bg-primary hover:text-background'
        } ${isPending ? 'opacity-50' : ''}`}
      >
        {isPending ? 'WAIT...' : currentStatus ? 'ACTIVE' : 'DRAFT'}
      </button>
    );
  }

  return (
    <button 
      onClick={() => {
        if (confirm('Are you sure you want to delete this record?')) handleAction();
      }} 
      disabled={isPending}
      className={`text-sm tracking-widest uppercase font-bold text-danger/50 hover:text-danger transition-colors ${isPending ? 'opacity-50' : ''}`}
    >
      {isPending ? '...' : 'Delete'}
    </button>
  );
}
