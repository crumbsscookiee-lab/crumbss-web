import { ArrowRight, Asterisk, Sparkle, ArrowDownRight } from "lucide-react";
import MenuShowcase from "@/components/MenuShowcase";
import OrderForm from "@/components/OrderForm";
import { db } from "@/lib/api";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const activeBatch = await db.batches.getActive();
  const products = await db.products.getOptions();

  return (
    <main className="flex-1 relative">
      {/* Editorial Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col justify-center px-6 md:px-12 pt-24 overflow-hidden border-b border-primary/20">
        <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-surface/50 clip-path-slant -z-10" />
        
        <div className="flex items-center gap-4 mb-8 text-accent font-medium tracking-widest uppercase text-sm">
          <Asterisk size={18} className="animate-spin-slow" />
          <span>Artisanal Batch Bakery</span>
        </div>
        
        <h1 className="font-serif text-[12vw] leading-[0.85] tracking-tighter text-primary font-medium mb-12 relative z-10 flex flex-col items-start mix-blend-multiply">
          <span className="ml-0 md:ml-12 italic opacity-90">Small</span>
          <span className="relative">
            Crumbs.
            <span className="absolute -bottom-8 -right-8 w-24 h-24 bg-accent rounded-full blur-[80px] -z-10" />
          </span>
          <span className="ml-12 md:ml-32 mt-4 flex items-center gap-4 md:gap-12">
            Big <span className="italic text-accent">Joy</span>
          </span>
        </h1>
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between max-w-7xl mx-auto w-full gap-12 mt-12">
          <p className="text-xl md:text-2xl text-primary/80 max-w-lg font-light leading-relaxed">
            Crafted entirely by hand. 
            Meticulously baked. 
            An experience of rich textures and unforgettable crunch in every single bite.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#order-form" className="group flex items-center justify-center w-32 h-32 bg-primary text-background rounded-full hover:bg-accent transition-colors duration-500 relative">
              <span className="font-serif italic text-xl">Order</span>
              <ArrowDownRight size={24} className="absolute bottom-6 right-6 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Brand Story & Vision */}
      <section className="py-32 px-6 md:px-12 relative bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          <div className="lg:w-5/12 pt-12">
            <h2 className="text-5xl md:text-7xl font-serif leading-[0.9] tracking-tight mb-8">
              The <br/><span className="italic text-accent">C.R.U.N.C.H</span><br/> Experience.
            </h2>
            <p className="text-xl font-serif italic text-primary/90 mb-6">
              "Menjadi produsen food and beverage yang terpercaya."
            </p>
            <p className="text-lg leading-relaxed text-primary/70 mb-12">
              CRUMBSS adalah spesialis artisan crispy cookies yang mengedepankan tekstur garing sempurna dan aroma mentega premium yang menggoda. Kami percaya bahwa kebahagiaan sejati ada pada bunyi "kriuk" pertama dan remah-remah lezat yang tertinggal. Dikombinasikan dengan kopi pilihan, CRUMBSS adalah standar baru untuk camilan santai yang estetik, modern, dan nagih.
            </p>
            
            {/* <div className="space-y-6">
              <h3 className="text-sm font-serif uppercase tracking-widest text-primary/50">Misi Kami</h3>
              <ul className="space-y-4 text-primary/80 font-light text-sm leading-relaxed">
                <li className="flex gap-3"><Sparkle size={16} className="text-accent shrink-0 mt-1" /> Menyebarkan kebahagiaan remah demi remah untuk generasi masa kini.</li>
                <li className="flex gap-3"><Sparkle size={16} className="text-accent shrink-0 mt-1" /> Menyajikan produk dengan bahan dan teknik terpercaya untuk menjaga standar rasa.</li>
                <li className="flex gap-3"><Sparkle size={16} className="text-accent shrink-0 mt-1" /> Membangun koneksi yang hangat melalui pelayanan yang tulus.</li>
                <li className="flex gap-3"><Sparkle size={16} className="text-accent shrink-0 mt-1" /> Berinovasi konsisten menghadirkan pengalaman rasa baru yang relevan.</li>
              </ul>
            </div> */}
          </div>
          
          <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 mt-12 lg:mt-0">
            {[
              { letter: "C", title: "Cuan", desc: "Keuntungan yang terasa sampai ke gigitan terakhir" },
              { letter: "R", title: "Real", desc: "Menggunakan bahan-bahan asli, bukan bahan buatan." },
              { letter: "U", title: "Unique", desc: "Perpaduan rasa yang tidak membosankan (modern twist)." },
              { letter: "N", title: "Noble", desc: "Kualitas bahan kelas atas untuk rasa yang mewah." },
              { letter: "C", title: "Clean", desc: "Penyajian dan kemasan yang minimalis & estetik." },
              { letter: "H", title: "Honest", desc: "Tanpa pemanis buatan, rasa manis yang pas." }
            ].map((item, i) => (
              <div key={i} className={`relative ${i % 2 === 1 ? 'sm:mt-16' : ''}`}>
                <span className="text-7xl font-serif text-accent/10 absolute -top-8 -left-6 -z-10 select-none">{item.letter}</span>
                <h3 className="text-2xl font-serif font-medium mb-3 flex items-center gap-3">
                  {item.title}
                </h3>
                <p className="text-primary/70 leading-relaxed font-light text-sm">{item.desc}</p>
                <div className="w-full h-[1px] bg-primary/20 mt-6" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <MenuShowcase />
      <OrderForm products={products} activeBatch={activeBatch} />

      {/* Editorial Footer */}
      <footer className="bg-primary text-background py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-background/20 pb-16">
          <div className="md:col-span-2">
            <h2 className="text-6xl md:text-8xl font-serif italic mb-6">Crumbss.</h2>
            <p className="text-2xl font-light text-background/70 max-w-md">Small crumbs, big joy. Your daily dose of artisanal crunch.</p>
          </div>
          <div className="flex flex-col gap-6 justify-end">
            <a href="https://www.instagram.com/crumbss.cookies" className="text-xl font-serif hover:text-secondary transition-colors flex items-center gap-2 group">
              Instagram <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </a>
            <a href="https://wa.me/62895418600555" className="text-xl font-serif hover:text-secondary transition-colors flex items-center gap-2 group">
              WhatsApp <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex justify-between text-background/50 text-sm tracking-widest uppercase">
          <span>© 2026 Crumbss Bakery</span>
          <span>Crafted with passion</span>
        </div>
      </footer>
    </main>
  );
}
