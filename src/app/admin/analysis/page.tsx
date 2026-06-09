import { createClient } from "@/utils/supabase/server";
import { TrendingUp, Users, Heart, Eye, Camera, Save, Calendar, Video as VideoIcon } from "lucide-react";
import { GeneralLineChart, MultiLineChart } from "../DashboardCharts";
import { saveSocialMetrics } from "../actions";

export default async function AnalysisPage() {
  const supabase = await createClient();
  
  // 1. Fetch Orders for Customer Growth
  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, wa_number')
    .order('created_at', { ascending: true });

  // 2. Fetch Social Metrics
  const { data: socialMetrics } = await supabase
    .from('social_metrics')
    .select('*')
    .order('date', { ascending: true });

  // Process Customer Growth Data
  const customerGrowthData: any[] = [];
  const uniqueCustomers = new Set();
  
  const dailyCustomers: Record<string, { date: string, total: number, unique: number }> = {};
  
  (orders || []).forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    if (!dailyCustomers[date]) {
      dailyCustomers[date] = { date, total: 0, unique: 0 };
    }
    dailyCustomers[date].total += 1;
    if (!uniqueCustomers.has(order.wa_number)) {
      uniqueCustomers.add(order.wa_number);
      dailyCustomers[date].unique = uniqueCustomers.size;
    } else {
      dailyCustomers[date].unique = uniqueCustomers.size;
    }
  });

  const customerChartData = Object.values(dailyCustomers);

  // Process Social Metrics for Charts
  const socialChartData = (socialMetrics || []).map(m => ({
    ...m,
    date: new Date(m.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  }));

  const today = new Date().toISOString().split('T')[0];
  const latestMetrics = socialMetrics?.[socialMetrics.length - 1] || {
    instagram_followers: 0,
    instagram_likes: 0,
    instagram_views: 0,
    tiktok_followers: 0,
    tiktok_likes: 0,
    tiktok_views: 0
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 bg-surface/20">
      <header className="p-8 md:p-12 border-b border-primary/20 bg-background">
        <h2 className="text-5xl md:text-7xl font-serif leading-[0.8] tracking-tighter mb-4 text-primary">
          Growth<br/><span className="italic text-accent">Analysis.</span>
        </h2>
        <p className="text-primary/70 text-lg font-light">Track your brand's digital evolution.</p>
      </header>

      {/* Social Media Update Form */}
      <section className="p-8 md:p-12 border-b border-primary/20 bg-background/50">
        <div className="max-w-6xl">
          <div className="flex items-center gap-3 text-primary mb-8">
            <TrendingUp size={24} className="text-accent" />
            <h3 className="text-3xl font-serif italic">Update Social Stats</h3>
          </div>
          <form action={saveSocialMetrics} className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 max-w-xs">
              <label className="text-xs tracking-widest uppercase font-bold text-primary/60">Recording Date</label>
              <input 
                name="date" 
                type="date" 
                defaultValue={today}
                required 
                className="bg-background border border-primary/20 p-3 outline-none focus:border-accent text-primary font-mono" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Instagram Inputs */}
              <div className="space-y-6 p-6 border border-primary/10 bg-background">
                <div className="flex items-center gap-2 text-primary">
                  <Camera size={20} className="text-[#E1306C]" />
                  <span className="font-bold tracking-widest uppercase text-sm">Instagram</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Followers</label>
                    <input name="instagram_followers" type="number" placeholder={latestMetrics.instagram_followers.toString()} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Likes</label>
                    <input name="instagram_likes" type="number" placeholder={latestMetrics.instagram_likes.toString()} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Views</label>
                    <input name="instagram_views" type="number" placeholder={latestMetrics.instagram_views.toString()} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                </div>
              </div>

              {/* TikTok Inputs */}
              <div className="space-y-6 p-6 border border-primary/10 bg-background">
                <div className="flex items-center gap-2 text-primary">
                  <VideoIcon size={20} className="text-[#00F2EA]" />
                  <span className="font-bold tracking-widest uppercase text-sm">TikTok</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Followers</label>
                    <input name="tiktok_followers" type="number" placeholder={latestMetrics.tiktok_followers?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Likes</label>
                    <input name="tiktok_likes" type="number" placeholder={latestMetrics.tiktok_likes?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Views</label>
                    <input name="tiktok_views" type="number" placeholder={latestMetrics.tiktok_views?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="flex items-center justify-center gap-3 bg-primary text-background py-4 px-8 hover:bg-accent transition-colors font-serif italic text-xl">
              Save All Metrics <Save size={20} />
            </button>
          </form>
        </div>
      </section>

      <section className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Followers Growth */}
        <div className="bg-background border border-primary/20 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-primary">
              <Users size={20} className="text-accent" />
              <h3 className="text-2xl font-serif italic">Followers Comparison</h3>
            </div>
          </div>
          <MultiLineChart 
            data={socialChartData}
            lines={[
              { key: 'instagram_followers', color: '#E1306C', label: 'Instagram' },
              { key: 'tiktok_followers', color: '#00F2EA', label: 'TikTok' }
            ]}
          />
        </div>

        {/* Engagement Chart */}
        <div className="bg-background border border-primary/20 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-primary">
              <Heart size={20} className="text-accent" />
              <h3 className="text-2xl font-serif italic">Total Views Comparison</h3>
            </div>
          </div>
          <MultiLineChart 
            data={socialChartData}
            lines={[
              { key: 'instagram_views', color: '#E1306C', label: 'IG Views' },
              { key: 'tiktok_views', color: '#00F2EA', label: 'TT Views' }
            ]}
          />
        </div>

        {/* Customer Growth */}
        <div className="lg:col-span-2 bg-background border border-primary/20 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-primary">
              <TrendingUp size={20} className="text-accent" />
              <h3 className="text-2xl font-serif italic">Cumulative Customer Growth</h3>
            </div>
            <p className="text-xs text-primary/40 max-w-xs text-right">Unique customers (by WA number) over time.</p>
          </div>
          <GeneralLineChart 
            data={customerChartData} 
            dataKey="unique" 
            label="Unique Customers"
            color="#7c2d12"
          />
        </div>
      </section>
    </div>
  );
}
