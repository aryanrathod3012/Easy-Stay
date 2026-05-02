import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusColors = {
  payment_held: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default function AdminBookings() {
  const navigate = useNavigate();

  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-all-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
  });

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.commission || 0), 0);
  const totalVolume = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div className="max-w-lg mx-auto px-5 pt-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold">All Bookings</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Platform Revenue (2%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold">₹{totalVolume.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {bookings.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{b.pg_title}</h3>
                    <p className="text-xs text-muted-foreground">By {b.user_name}</p>
                  </div>
                  <Badge className={`${statusColors[b.status]} border-0 text-[10px] capitalize`}>{b.status?.replace('_', ' ')}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold">₹{b.amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Commission</p>
                    <p className="font-bold text-green-600">₹{b.commission?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium">₹{b.owner_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">{b.created_date ? format(new Date(b.created_date), 'MMM d') : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {bookings.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No bookings yet</p>
        )}
      </div>
    </div>
  );
}
