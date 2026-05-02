import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MapPin, Sparkles, ArrowRight, Star, Building2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import PGCard from '@/components/pg/PGCard';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import LocationSearchBar from '@/components/location/LocationSearchBar';

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: featuredPGs = [] } = useQuery({
    queryKey: ['featured-pgs'],
    queryFn: () => base44.entities.PGListing.filter({ status: 'approved' }, '-average_rating', 6),
  });

  const { isPulling, pullProgress, isRefreshing } = usePullToRefresh(
    () => queryClient.refetchQueries({ queryKey: ['featured-pgs'] })
  );

  const filteredPGs = user?.gender
    ? featuredPGs.filter(pg => {
        if (user.gender === 'male') return pg.gender_type === 'boys' || pg.gender_type === 'unisex';
        if (user.gender === 'female') return pg.gender_type === 'girls' || pg.gender_type === 'unisex';
        return true;
      })
    : featuredPGs;

  return (
    <div className="max-w-lg mx-auto">
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div className="flex items-center justify-center py-3 text-primary"
          style={{ transform: `translateY(${isPulling ? pullProgress * 16 : 0}px)` }}>
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullProgress * 360}deg)` }} />
        </div>
      )}
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary-foreground/80 text-sm font-medium">
            {user ? `Hey, ${user.full_name?.split(' ')[0] || 'there'} 👋` : 'Welcome to'}
          </p>
          <h1 className="text-3xl font-heading font-bold text-primary-foreground mt-1">Easy Stay</h1>
          <p className="text-primary-foreground/70 text-sm mt-2 leading-snug">Find Safe, Verified PGs & Hostels with Smart AI Search</p>

          <Link to="/search" className="block mt-6">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3 border border-white/20">
              <MapPin className="w-5 h-5 text-primary-foreground/70 flex-shrink-0" />
              <span className="text-primary-foreground/60 text-sm">Search by location, area, city...</span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4 grid grid-cols-3 gap-3">
          <Link to="/search" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium">Nearby</span>
          </Link>
          <Link to="/ai-assistant" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-medium">AI Match</span>
          </Link>
          <Link to="/search?sort=rating" className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xs font-medium">Top Rated</span>
          </Link>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="px-5 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold">Featured PGs</h2>
          <Link to="/search" className="text-sm text-primary font-medium flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {filteredPGs.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-semibold">No PGs listed yet</p>
            <p className="text-sm text-muted-foreground mt-1">PG listings will appear here once approved</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPGs.map((pg, i) => (
              <PGCard key={pg.id} pg={pg} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  );
}
