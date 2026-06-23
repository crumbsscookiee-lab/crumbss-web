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

  // Process Customer Growth Data (Weekly Grouping)
  const uniqueCustomers = new Set();
  const weeklyCustomers: Record<string, { date: string, unique: number, _originalDate: Date }> = {};
  
  (orders || []).forEach(order => {
    const d = new Date(order.created_at);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekKey = monday.toISOString().split('T')[0];
    const weekLabel = monday.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    if (!uniqueCustomers.has(order.wa_number)) {
      uniqueCustomers.add(order.wa_number);
    }

    // We want the total unique customers up to the end of that week
    if (!weeklyCustomers[weekKey] || new Date(order.created_at) > weeklyCustomers[weekKey]._originalDate) {
      weeklyCustomers[weekKey] = {
        date: weekLabel,
        unique: uniqueCustomers.size,
        _originalDate: new Date(order.created_at)
      };
    } else {
      // Still need to update the unique count if more customers were added later in the week
      weeklyCustomers[weekKey].unique = uniqueCustomers.size;
    }
  });

  const customerChartData = Object.values(weeklyCustomers).sort((a, b) => 
    a._originalDate.getTime() - b._originalDate.getTime()
  );

  // Process Social Metrics for Charts (Weekly Grouping)
  const groupedWeeklyMetrics: Record<string, any> = {};
  
  (socialMetrics || []).forEach(m => {
    const d = new Date(m.date);
    // Get the Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const weekKey = monday.toISOString().split('T')[0];
    const weekLabel = monday.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

    // For metrics, we want the latest value in that week
    if (!groupedWeeklyMetrics[weekKey] || new Date(m.date) >= new Date(groupedWeeklyMetrics[weekKey]._originalDate)) {
      groupedWeeklyMetrics[weekKey] = {
        ...m,
        date: weekLabel,
        _originalDate: m.date
      };
    }
  });

  const socialChartData = Object.values(groupedWeeklyMetrics).sort((a, b) => 
    new Date(a._originalDate).getTime() - new Date(b._originalDate).getTime()
  );

  const today = new Date().toISOString().split('T')[0];
  const latestMetrics = socialMetrics?.[socialMetrics.length - 1] || {
    instagram_followers: 0,
    instagram_likes: 0,
    instagram_views: 0,
    instagram_posts: 0,
    tiktok_followers: 0,
    tiktok_likes: 0,
    tiktok_views: 0,
    tiktok_posts: 0
  };

  const calculatePeakGrowth = (data: any[], key: string) => {
    let maxGrowth = 0;
    let maxWeek = "";
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1][key] || 0;
      const curr = data[i][key] || 0;
      if (prev > 0) {
        const growth = ((curr - prev) / prev) * 100;
        if (growth > maxGrowth) {
          maxGrowth = growth;
          maxWeek = data[i].date;
        }
      } else if (prev === 0 && curr > 0) {
        if (100 > maxGrowth) {
          maxGrowth = 100;
          maxWeek = data[i].date;
        }
      }
    }
    return { growth: maxGrowth, week: maxWeek };
  };

  const customerPeak = calculatePeakGrowth(customerChartData, 'unique');

  const igPeaks = {
    followers: calculatePeakGrowth(socialChartData, 'instagram_followers'),
    likes: calculatePeakGrowth(socialChartData, 'instagram_likes'),
    views: calculatePeakGrowth(socialChartData, 'instagram_views'),
    posts: calculatePeakGrowth(socialChartData, 'instagram_posts'),
  };

  const ttPeaks = {
    followers: calculatePeakGrowth(socialChartData, 'tiktok_followers'),
    likes: calculatePeakGrowth(socialChartData, 'tiktok_likes'),
    views: calculatePeakGrowth(socialChartData, 'tiktok_views'),
    posts: calculatePeakGrowth(socialChartData, 'tiktok_posts'),
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
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Followers</label>
                    <input name="instagram_followers" type="number" defaultValue={latestMetrics.instagram_followers.toString()} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Likes</label>
                    <input name="instagram_likes" type="number" defaultValue={latestMetrics.instagram_likes.toString()} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Views</label>
                    <input name="instagram_views" type="number" defaultValue={latestMetrics.instagram_views.toString()} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Posts</label>
                    <input name="instagram_posts" type="number" defaultValue={latestMetrics.instagram_posts?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                </div>
              </div>

              {/* TikTok Inputs */}
              <div className="space-y-6 p-6 border border-primary/10 bg-background">
                <div className="flex items-center gap-2 text-primary">
                  <VideoIcon size={20} className="text-[#00F2EA]" />
                  <span className="font-bold tracking-widest uppercase text-sm">TikTok</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Followers</label>
                    <input name="tiktok_followers" type="number" defaultValue={latestMetrics.tiktok_followers?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Likes</label>
                    <input name="tiktok_likes" type="number" defaultValue={latestMetrics.tiktok_likes?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Views</label>
                    <input name="tiktok_views" type="number" defaultValue={latestMetrics.tiktok_views?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Posts</label>
                    <input name="tiktok_posts" type="number" defaultValue={latestMetrics.tiktok_posts?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
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
        {/* Instagram Analysis */}
        <div className="bg-background border border-primary/20 p-8 shadow-sm flex flex-col">
          <div className="flex flex-col mb-8 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <Camera size={20} className="text-[#E1306C]" />
                <h3 className="text-2xl font-serif italic">Instagram Performance</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {igPeaks.followers.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#E1306C]/30 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Flw</span>
                  <span className="text-[10px] font-bold text-green-600">+{igPeaks.followers.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({igPeaks.followers.week})</span>
                </div>
              )}
              {igPeaks.likes.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#833AB4]/30 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Likes</span>
                  <span className="text-[10px] font-bold text-green-600">+{igPeaks.likes.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({igPeaks.likes.week})</span>
                </div>
              )}
              {igPeaks.views.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#F77737]/30 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Views</span>
                  <span className="text-[10px] font-bold text-green-600">+{igPeaks.views.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({igPeaks.views.week})</span>
                </div>
              )}
              {igPeaks.posts.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#FFDC80]/50 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Posts</span>
                  <span className="text-[10px] font-bold text-green-600">+{igPeaks.posts.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({igPeaks.posts.week})</span>
                </div>
              )}
            </div>
          </div>
          <MultiLineChart 
            data={socialChartData}
            lines={[
              { key: 'instagram_followers', color: '#E1306C', label: 'Followers' },
              { key: 'instagram_likes', color: '#833AB4', label: 'Likes' },
              { key: 'instagram_views', color: '#F77737', label: 'Views' },
              { key: 'instagram_posts', color: '#FFDC80', label: 'Posts' }
            ]}
          />
        </div>

        {/* TikTok Analysis */}
        <div className="bg-background border border-primary/20 p-8 shadow-sm flex flex-col">
          <div className="flex flex-col mb-8 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <VideoIcon size={20} className="text-[#00F2EA]" />
                <h3 className="text-2xl font-serif italic">TikTok Performance</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ttPeaks.followers.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#00F2EA]/50 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Flw</span>
                  <span className="text-[10px] font-bold text-green-600">+{ttPeaks.followers.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({ttPeaks.followers.week})</span>
                </div>
              )}
              {ttPeaks.likes.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#FF0050]/30 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Likes</span>
                  <span className="text-[10px] font-bold text-green-600">+{ttPeaks.likes.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({ttPeaks.likes.week})</span>
                </div>
              )}
              {ttPeaks.views.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#000000]/30 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Views</span>
                  <span className="text-[10px] font-bold text-green-600">+{ttPeaks.views.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({ttPeaks.views.week})</span>
                </div>
              )}
              {ttPeaks.posts.growth > 0 && (
                <div className="flex items-center gap-2 bg-background border border-[#EE1D52]/30 px-2 py-1">
                  <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">Posts</span>
                  <span className="text-[10px] font-bold text-green-600">+{ttPeaks.posts.growth.toFixed(0)}%</span>
                  <span className="text-[8px] tracking-widest uppercase text-primary/40">({ttPeaks.posts.week})</span>
                </div>
              )}
            </div>
          </div>
          <MultiLineChart 
            data={socialChartData}
            lines={[
              { key: 'tiktok_followers', color: '#00F2EA', label: 'Followers' },
              { key: 'tiktok_likes', color: '#FF0050', label: 'Likes' },
              { key: 'tiktok_views', color: '#000000', label: 'Views' },
              { key: 'tiktok_posts', color: '#EE1D52', label: 'Posts' }
            ]}
          />
        </div>

        {/* Customer Growth */}
        <div className="lg:col-span-2 bg-background border border-primary/20 p-8 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3 text-primary">
              <TrendingUp size={20} className="text-accent" />
              <h3 className="text-2xl font-serif italic">Cumulative Customer Growth</h3>
            </div>
            <div className="flex items-center gap-4">
              {customerPeak.growth > 0 && (
                <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 border border-accent/20">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60">Peak Acq. Growth</span>
                  <span className="text-xs font-bold text-green-600">+{customerPeak.growth.toFixed(1)}%</span>
                  <span className="text-[10px] tracking-widest uppercase text-primary/60">({customerPeak.week})</span>
                </div>
              )}
              <p className="text-xs text-primary/40 text-right hidden md:block">Unique customers (by WA number) over time.</p>
            </div>
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
