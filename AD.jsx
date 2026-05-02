import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Users, CalendarCheck, IndianRupee, ChevronRight, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { data: allListings = [] } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: () => base44.entities.PGListing.list('-created_date'),
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const totalRevenue = allBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.commission || 0), 0);
  const pendingListings = allListings.filter(l => l.status === 'pending').length;
  const activeBookings = allBookings.filter(b => b.status === 'payment_held' || b.status === 'confirmed').length;

  const stats = [
    { label: 'Total Revenue (2%)', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600 bg-green-100' },
    { label: 'Total PG Listings', value: allListings.length, icon: Building2, color: 'text-primary bg-primary/10' },
    { label: 'Active Bookings', value: activeBookings, icon: CalendarCheck, color: 'text-accent bg-accent/10' },
    { label: 'Total Users', value: allUsers.length, icon: Users, color: 'text-purple-600 bg-purple-100' },
  ];

  return (
    <div className="max-w-lg mx-auto px-5 pt-6">
      <h1 className="text-xl font-heading font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {pendingListings > 0 && (
        <Link to="/admin/listings">
          <Card className="mb-4 border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-yellow-800">{pendingListings} Pending Approvals</p>
                <p className="text-xs text-yellow-600">Review and approve PG listings</p>
              </div>
              <ChevronRight className="w-5 h-5 text-yellow-600" />
            </CardContent>
          </Card>
        </Link>
      )}

      <div className="space-y-3">
        <Link to="/admin/listings">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Manage Listings</p>
                  <p className="text-xs text-muted-foreground">Approve, reject, or remove PGs</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/bookings">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Manage Bookings</p>
                  <p className="text-xs text-muted-foreground">View and track all bookings</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
