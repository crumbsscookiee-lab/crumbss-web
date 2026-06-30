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
  
  // 1. Get order details to restore quota
  const { data: order } = await supabase.from('orders').select('batch_id, items').eq('id', id).single()
  
  if (order && order.batch_id) {
    const { data: batch } = await supabase.from('batches').select('quota, menus').eq('id', order.batch_id).single()
    
    if (batch) {
      const orderItems = order.items as any[]
      const updatedMenus = { ...(batch.menus || {}) } as Record<string, number>
      let restoredTotal = 0

      orderItems.forEach((item: any) => {
        const pId = item.productId || item.product_id
        const q = item.qty || item.quantity || 0
        if (pId) {
          updatedMenus[pId] = (updatedMenus[pId] || 0) + q
          restoredTotal += q
        }
      })

      await supabase.from('batches').update({
        quota: (batch.quota || 0) + restoredTotal,
        menus: updatedMenus
      }).eq('id', order.batch_id)
    }
  }

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
  const taste_description = formData.get('taste_description') as string
  const { error } = await supabase.from('products').insert([{ 
    name, 
    price, 
    taste_description,
    is_active: true 
  }])
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

export async function saveSocialMetrics(formData: FormData) {
  const supabase = await createClient()
  const date = formData.get('date') as string
  const instagram_followers = parseInt(formData.get('instagram_followers') as string) || 0
  const instagram_likes = parseInt(formData.get('instagram_likes') as string) || 0
  const instagram_views = parseInt(formData.get('instagram_views') as string) || 0
  const instagram_posts = parseInt(formData.get('instagram_posts') as string) || 0
  const tiktok_followers = parseInt(formData.get('tiktok_followers') as string) || 0
  const tiktok_likes = parseInt(formData.get('tiktok_likes') as string) || 0
  const tiktok_views = parseInt(formData.get('tiktok_views') as string) || 0
  const tiktok_posts = parseInt(formData.get('tiktok_posts') as string) || 0

  const web_visitors = parseInt(formData.get('web_visitors') as string) || 0
  const web_pageviews = parseInt(formData.get('web_pageviews') as string) || 0

  const { error } = await supabase.from('social_metrics').upsert({
    date,
    instagram_followers,
    instagram_likes,
    instagram_views,
    instagram_posts,
    tiktok_followers,
    tiktok_likes,
    tiktok_views,
    tiktok_posts,
    web_visitors,
    web_pageviews
  }, { onConflict: 'date' })

  if (error) console.error("saveSocialMetrics Error:", error)
  revalidatePath('/admin/analysis')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
