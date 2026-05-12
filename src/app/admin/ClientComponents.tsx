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
import { Filter } from 'lucide-react';

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
