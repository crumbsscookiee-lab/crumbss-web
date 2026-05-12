'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleBatchStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('batches').update({ is_open: !currentStatus }).eq('id', id)
  if (error) console.error("toggleBatchStatus Error:", error)
  revalidatePath('/admin')
}

export async function createBatch(formData: FormData) {
  const supabase = await createClient()
  const batch_date = formData.get('batch_date') as string
  
  const menus: Record<string, number> = {};
  let totalQuota = 0;
  
  formData.forEach((value, key) => {
    if (key.startsWith('product_') && value === 'on') {
      const productId = key.replace('product_', '');
      const quotaStr = formData.get(`quota_${productId}`);
      const quota = parseInt(quotaStr as string) || 0;
      if (quota > 0) {
        menus[productId] = quota;
        totalQuota += quota;
      }
    }
  });

  const { error } = await supabase.from('batches').insert([{ 
    batch_date, 
    quota: totalQuota, 
    menus, 
    is_open: false 
  }])
  if (error) console.error("createBatch Error:", error)
  revalidatePath('/admin')
}

export async function deleteBatch(id: string) {
  const supabase = await createClient()
  await supabase.from('batches').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) console.error("updateOrderStatus Error:", error)
  revalidatePath('/admin')
}

export async function deleteOrder(id: string) {
  const supabase = await createClient()
  await supabase.from('orders').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function addExpense(formData: FormData) {
  const supabase = await createClient()
  const amount = parseInt(formData.get('amount') as string)
  const note = formData.get('note') as string || 'Manual Ops'
  const { error } = await supabase.from('expenses').insert([{ amount, note }])
  if (error) console.error("addExpense Error:", error)
  revalidatePath('/admin')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  await supabase.from('expenses').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function addManualIncome(formData: FormData) {
  const supabase = await createClient()
  const amount = parseInt(formData.get('amount') as string)
  const note = formData.get('note') as string || 'Manual Income'
  const { error } = await supabase.from('manual_incomes').insert([{ amount, note }])
  if (error) console.error("addManualIncome Error:", error)
  revalidatePath('/admin')
}

export async function deleteManualIncome(id: string) {
  const supabase = await createClient()
  await supabase.from('manual_incomes').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const price = parseInt(formData.get('price') as string)
  const { error } = await supabase.from('products').insert([{ name, price, is_active: true }])
  if (error) console.error("createProduct Error:", error)
  revalidatePath('/admin')
}

export async function toggleProductActive(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id)
  revalidatePath('/admin')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
