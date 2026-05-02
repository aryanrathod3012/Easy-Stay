import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Plus, IndianRupee, CalendarCheck, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myListings = [] } = useQuery({
    queryKey: ['owner-listings', user?.email],
    queryFn: () => base44.entities.PGListing.filter({ owner_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['owner-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ owner_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const totalEarnings = myBookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.owner_amount || 0), 0);

  const activeBookings = myBookings.filter(b => b.status === 'confirmed' || b.status === 'payment_held').length;

  return (
    <div className="max-w-lg mx-auto px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">My Properties</h1>
        <Link to="/owner/add-pg">
          <Button size="sm" className="rounded-xl gap-1">
            <Plus className="w-4 h-4" /> Add PG
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Building2 className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{myListings.length}</p>
            <p className="text-xs text-muted-foreground">Properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <CalendarCheck className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold">{activeBookings}</p>
            <p className="text-xs text-muted-foreground">Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <IndianRupee className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold">₹{(totalEarnings / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <h2 className="font-heading font-bold mb-3">Your Listings</h2>
      {myListings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold">No properties yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first PG listing</p>
            <Link to="/owner/add-pg">
              <Button className="mt-4">Add PG</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myListings.map((pg, i) => (
            <motion.div key={pg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/owner/edit-pg?id=${pg.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 flex gap-4">
                    <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&h=80&fit=crop'} alt="" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-heading font-semibold text-sm truncate">{pg.title}</h3>
                        <Badge className={`${statusColors[pg.status]} border-0 text-[10px] capitalize flex-shrink-0`}>{pg.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{pg.area}, {pg.city}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-primary">₹{pg.price_per_month?.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{pg.available_rooms || 0} rooms avail.</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
