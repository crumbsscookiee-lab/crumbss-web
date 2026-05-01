'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Cookie } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-primary selection:text-background">
      <div className="w-full max-w-md">
        <div className="mb-12 flex justify-center">
          <div className="w-20 h-20 bg-primary text-background flex items-center justify-center rounded-none shadow-2xl">
            <Cookie size={40} />
          </div>
        </div>
        
        <h1 className="text-5xl font-serif text-primary text-center mb-2 italic">Admin Access</h1>
        <p className="text-primary/60 text-center mb-10 tracking-widest uppercase text-sm">Crumbss Bakery Internal</p>
        
        <form onSubmit={handleLogin} className="space-y-8 bg-surface/50 p-8 md:p-12 border border-primary/20 shadow-xl">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-3 relative">
            <label className="text-sm tracking-widest uppercase text-primary/60">Email Address</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-background/50 border-b-2 border-primary/20 focus:border-accent py-4 px-4 outline-none transition-colors font-serif text-xl focus:bg-background" 
              placeholder="admin@crumbss.com" 
            />
          </div>
          
          <div className="space-y-3 relative">
            <label className="text-sm tracking-widest uppercase text-primary/60">Password</label>
            <input 
              required 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background/50 border-b-2 border-primary/20 focus:border-accent py-4 px-4 outline-none transition-colors font-serif text-xl focus:bg-background" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full bg-primary text-background hover:bg-accent transition-colors duration-500 py-6 text-xl font-serif italic disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
