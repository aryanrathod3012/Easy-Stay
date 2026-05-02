import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, Clock, CheckCircle2, XCircle, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const statusConfig = {
  payment_held: { label: 'Payment Held', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
};

export default function OwnerBookings() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['owner-all-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ owner_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const totalEarnings = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.owner_amount || 0), 0);
  const totalCommission = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.commission || 0), 0);

  return (
    <div className="max-w-lg mx-auto px-5 pt-6">
      <h1 className="text-xl font-heading font-bold mb-4">Booking Management</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">₹{totalEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Your Earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-primary">₹{totalCommission.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Platform Fee (2%)</p>
          </CardContent>
        </Card>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <CalendarCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="font-heading font-bold text-lg">No bookings yet</p>
          <p className="text-muted-foreground text-sm mt-1">Bookings from users will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b, i) => {
            const config = statusConfig[b.status] || statusConfig.payment_held;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-sm">{b.pg_title}</h3>
                        <p className="text-xs text-muted-foreground">{b.user_name} ({b.user_email})</p>
                      </div>
                      <Badge className={`${config.color} border-0 text-[10px]`}>{config.label}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                      <div>
                        <p className="text-muted-foreground">Check-in</p>
                        <p className="font-medium">{b.check_in_date ? format(new Date(b.check_in_date), 'MMM d') : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">You Earn</p>
                        <p className="font-bold text-green-600">₹{b.owner_amount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Platform Fee</p>
                        <p className="font-medium">₹{b.commission?.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
