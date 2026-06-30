import { createClient } from "@/utils/supabase/server";
import { TrendingUp, Users, Heart, Eye, Camera, Save, Calendar, Video as VideoIcon, Globe, BarChart3 } from "lucide-react";
import { GeneralLineChart, MultiLineChart, PeakGrowthChart } from "../DashboardCharts";
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
    tiktok_posts: 0,
    web_visitors: 0,
    web_pageviews: 0
  };

  const calculateGrowthStats = (data: any[], key: string) => {
    let maxGrowth = 0;
    let maxWeek = "";
    let totalGrowth = 0;
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1][key] || 0;
      const curr = data[i][key] || 0;
      if (prev > 0) {
        const growth = ((curr - prev) / prev) * 100;
        totalGrowth += growth;
        count++;
        if (growth > maxGrowth) {
          maxGrowth = growth;
          maxWeek = data[i].date;
        }
      } else if (prev === 0 && curr > 0) {
        totalGrowth += 100;
        count++;
        if (100 > maxGrowth) {
          maxGrowth = 100;
          maxWeek = data[i].date;
        }
      }
    }
    const avgGrowth = count > 0 ? totalGrowth / count : 0;
    return { growth: maxGrowth, week: maxWeek, avg: avgGrowth };
  };

  const customerPeak = calculateGrowthStats(customerChartData, 'unique');

  const igPeaks = {
    followers: calculateGrowthStats(socialChartData, 'instagram_followers'),
    likes: calculateGrowthStats(socialChartData, 'instagram_likes'),
    views: calculateGrowthStats(socialChartData, 'instagram_views'),
    posts: calculateGrowthStats(socialChartData, 'instagram_posts'),
  };

  const ttPeaks = {
    followers: calculateGrowthStats(socialChartData, 'tiktok_followers'),
    likes: calculateGrowthStats(socialChartData, 'tiktok_likes'),
    views: calculateGrowthStats(socialChartData, 'tiktok_views'),
    posts: calculateGrowthStats(socialChartData, 'tiktok_posts'),
  };

  const webPeaks = {
    visitors: calculateGrowthStats(socialChartData, 'web_visitors'),
    pageviews: calculateGrowthStats(socialChartData, 'web_pageviews'),
  };

  const peakData = [
    { name: 'IG Flw', growth: igPeaks.followers.growth, week: igPeaks.followers.week, fill: '#E1306C' },
    { name: 'IG Likes', growth: igPeaks.likes.growth, week: igPeaks.likes.week, fill: '#833AB4' },
    { name: 'IG Views', growth: igPeaks.views.growth, week: igPeaks.views.week, fill: '#F77737' },
    { name: 'IG Posts', growth: igPeaks.posts.growth, week: igPeaks.posts.week, fill: '#FFDC80' },
    { name: 'TT Flw', growth: ttPeaks.followers.growth, week: ttPeaks.followers.week, fill: '#00F2EA' },
    { name: 'TT Likes', growth: ttPeaks.likes.growth, week: ttPeaks.likes.week, fill: '#FF0050' },
    { name: 'TT Views', growth: ttPeaks.views.growth, week: ttPeaks.views.week, fill: '#000000' },
    { name: 'TT Posts', growth: ttPeaks.posts.growth, week: ttPeaks.posts.week, fill: '#EE1D52' },
    { name: 'Web Vis', growth: webPeaks.visitors.growth, week: webPeaks.visitors.week, fill: '#3b82f6' },
    { name: 'Web Pgv', growth: webPeaks.pageviews.growth, week: webPeaks.pageviews.week, fill: '#8b5cf6' },
  ].filter(d => d.growth > 0).sort((a, b) => b.growth - a.growth);

  const renderBadge = (label: string, peakData: { growth: number, week: string, avg: number }, baseColor: string) => {
    if (peakData.growth <= 0 && peakData.avg === 0) return null;
    return (
      <div className="flex items-center gap-2 bg-background border px-2 py-1" style={{ borderColor: `${baseColor}4D` }}>
        <span className="text-[9px] tracking-widest uppercase font-bold text-primary/60">{label}</span>
        {peakData.growth > 0 && (
          <span className="text-[10px] font-bold text-green-600" title="Peak Growth">
            +{peakData.growth.toFixed(0)}% <span className="text-[8px] font-normal text-primary/40">({peakData.week})</span>
          </span>
        )}
        {peakData.avg !== 0 && (
          <span className={`text-[10px] font-bold ${peakData.growth > 0 ? 'ml-1 pl-2 border-l' : ''} ${peakData.avg > 0 ? 'text-green-600' : 'text-danger'}`} style={peakData.growth > 0 ? { borderColor: `${baseColor}4D` } : {}} title="Average Growth">
            Avg: {peakData.avg > 0 ? '+' : ''}{peakData.avg.toFixed(0)}%
          </span>
        )}
      </div>
    );
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {/* Instagram Inputs */}
              <div className="space-y-6 p-6 border border-primary/10 bg-background">
                <div className="flex items-center gap-2 text-primary">
                  <Camera size={20} className="text-[#E1306C]" />
                  <span className="font-bold tracking-widest uppercase text-sm">Instagram</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
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

              {/* Website Inputs */}
              <div className="space-y-6 p-6 border border-primary/10 bg-background">
                <div className="flex items-center gap-2 text-primary">
                  <Globe size={20} className="text-[#3b82f6]" />
                  <span className="font-bold tracking-widest uppercase text-sm">Website</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Visitors</label>
                    <input name="web_visitors" type="number" defaultValue={latestMetrics.web_visitors?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-primary/40">Pageviews</label>
                    <input name="web_pageviews" type="number" defaultValue={latestMetrics.web_pageviews?.toString() || "0"} className="bg-surface border border-primary/10 p-2 text-sm outline-none focus:border-accent text-primary" />
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
              {renderBadge("Flw", igPeaks.followers, "#E1306C")}
              {renderBadge("Likes", igPeaks.likes, "#833AB4")}
              {renderBadge("Views", igPeaks.views, "#F77737")}
              {renderBadge("Posts", igPeaks.posts, "#FFDC80")}
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
              {renderBadge("Flw", ttPeaks.followers, "#00F2EA")}
              {renderBadge("Likes", ttPeaks.likes, "#FF0050")}
              {renderBadge("Views", ttPeaks.views, "#000000")}
              {renderBadge("Posts", ttPeaks.posts, "#EE1D52")}
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

        {/* Website Analysis */}
        <div className="bg-background border border-primary/20 p-8 shadow-sm flex flex-col">
          <div className="flex flex-col mb-8 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <Globe size={20} className="text-[#3b82f6]" />
                <h3 className="text-2xl font-serif italic">Website Performance</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {renderBadge("Visitors", webPeaks.visitors, "#3b82f6")}
              {renderBadge("Pageviews", webPeaks.pageviews, "#8b5cf6")}
            </div>
          </div>
          <MultiLineChart 
            data={socialChartData}
            lines={[
              { key: 'web_visitors', color: '#3b82f6', label: 'Visitors' },
              { key: 'web_pageviews', color: '#8b5cf6', label: 'Pageviews' }
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
            <div className="flex flex-col gap-2">
              {customerPeak.growth > 0 && (
                <div className="flex items-center justify-between gap-4 bg-accent/10 px-3 py-1.5 border border-accent/20">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60">Peak Acq. Growth</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-600">+{customerPeak.growth.toFixed(1)}%</span>
                    <span className="text-[10px] tracking-widest uppercase text-primary/60">({customerPeak.week})</span>
                  </div>
                </div>
              )}
              {customerPeak.avg !== 0 && (
                <div className="flex items-center justify-between gap-4 bg-accent/10 px-3 py-1.5 border border-accent/20">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-primary/60">Avg Acq. Growth</span>
                  <span className={`text-xs font-bold ${customerPeak.avg > 0 ? 'text-green-600' : 'text-danger'}`}>
                    {customerPeak.avg > 0 ? '+' : ''}{customerPeak.avg.toFixed(1)}%
                  </span>
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

        {/* Peak Growth Comparison */}
        {peakData.length > 0 && (
          <div className="lg:col-span-2 bg-background border border-primary/20 p-8 shadow-sm flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3 text-primary">
                <BarChart3 size={20} className="text-accent" />
                <h3 className="text-2xl font-serif italic">Peak Growth Comparison</h3>
              </div>
              <p className="text-xs text-primary/40 text-right hidden md:block">Highest percentage spike per metric.</p>
            </div>
            <PeakGrowthChart data={peakData} />
          </div>
        )}
      </section>
    </div>
  );
}
