import { db } from "@/lib/api";

export default async function MenuShowcase() {
  const products = await db.products.getOptions();

  return (
    <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto relative border-b border-primary/20" id="menu">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <h2 className="text-6xl md:text-8xl font-serif leading-[0.8] tracking-tighter">
          Our <br/><span className="italic text-secondary">Menu.</span>
        </h2>
        <p className="text-primary/70 max-w-md text-xl font-light leading-relaxed border-l border-primary/20 pl-6">
          A carefully curated selection of artisanal bakes. No fluff, just pure crunch and flavor.
        </p>
      </div>
      
      <div className="flex flex-col gap-0 border-t border-primary/20">
        {products.map((product, idx) => (
          <div 
            key={product.id} 
            className="group flex flex-col md:flex-row justify-between items-start md:items-center py-10 border-b border-primary/20 hover:bg-surface/50 transition-colors duration-500 px-4 -mx-4"
          >
            <div className="flex items-center gap-8">
              <span className="text-2xl font-serif text-accent/50 font-light">0{idx + 1}</span>
              <div className="flex flex-col">
                <h3 className="font-serif text-4xl md:text-5xl group-hover:translate-x-4 transition-transform duration-500 ease-out">{product.name}</h3>
                {product.taste_description && (
                  <p className="text-primary/60 text-sm mt-2 italic font-light group-hover:translate-x-4 transition-transform duration-700 delay-75 max-w-sm">
                    {product.taste_description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
              <div className="h-[1px] w-12 md:w-24 bg-primary/20 hidden md:block group-hover:w-32 transition-all duration-500" />
              <p className="font-serif italic text-2xl text-secondary">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
