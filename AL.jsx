import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };

export default function AdminListings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-all-listings'],
    queryFn: () => base44.entities.PGListing.list('-created_date'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PGListing.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast({ title: 'Listing Updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PGListing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-listings'] });
      toast({ title: 'Listing Deleted' });
    },
  });

  const renderList = (items) => (
    <div className="space-y-3 mt-4">
      {items.map((pg, i) => (
        <motion.div key={pg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <img src={pg.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=80&h=60&fit=crop'} alt="" className="w-16 h-14 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm truncate">{pg.title}</h3>
                    <Badge className={`${statusColors[pg.status]} border-0 text-[10px] capitalize`}>{pg.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{pg.owner_name} • {pg.area}, {pg.city}</p>
                  <p className="text-sm font-bold text-primary mt-1">₹{pg.price_per_month?.toLocaleString()}/mo</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Link to={`/pg/${pg.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1"><Eye className="w-3 h-3" />View</Button>
                </Link>
                {pg.status === 'pending' && (
                  <>
                    <Button size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700" onClick={() => updateMutation.mutate({ id: pg.id, status: 'approved' })}>
                      <CheckCircle2 className="w-3 h-3" />Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => updateMutation.mutate({ id: pg.id, status: 'rejected' })}>
                      <XCircle className="w-3 h-3" />Reject
                    </Button>
                  </>
                )}
                {pg.status !== 'pending' && (
                  <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => deleteMutation.mutate(pg.id)}>
                    <Trash2 className="w-3 h-3" />Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      {items.length === 0 && <p className="text-center text-muted-foreground py-8">No listings found</p>}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-5 pt-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold">Manage Listings</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1">Pending ({listings.filter(l => l.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">{renderList(listings.filter(l => l.status === 'pending'))}</TabsContent>
        <TabsContent value="approved">{renderList(listings.filter(l => l.status === 'approved'))}</TabsContent>
        <TabsContent value="rejected">{renderList(listings.filter(l => l.status === 'rejected'))}</TabsContent>
      </Tabs>
    </div>
  );
}
