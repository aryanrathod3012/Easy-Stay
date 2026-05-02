import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

export default function ReviewsList({ pgId }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', pgId],
    queryFn: () => base44.entities.Review.filter({ pg_id: pgId }, '-created_date'),
    enabled: !!pgId,
  });

  const submitReview = useMutation({
    mutationFn: async ({ optimisticReview }) => {
      await base44.entities.Review.create({
        user_email: user.email,
        user_name: user.full_name,
        pg_id: pgId,
        rating: optimisticReview.rating,
        comment: optimisticReview.comment,
      });
      // Update average rating on the PG
      const allReviews = [...reviews, { rating: optimisticReview.rating }];
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await base44.entities.PGListing.update(pgId, {
        average_rating: Math.round(avg * 10) / 10,
        total_reviews: allReviews.length,
      });
    },
    onMutate: async ({ optimisticReview }) => {
      // Cancel in-flight refetches
      await queryClient.cancelQueries({ queryKey: ['reviews', pgId] });
      // Snapshot
      const previous = queryClient.getQueryData(['reviews', pgId]);
      // Optimistically prepend
      queryClient.setQueryData(['reviews', pgId], old => [optimisticReview, ...(old || [])]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previous) {
        queryClient.setQueryData(['reviews', pgId], context.previous);
      }
    },
    onSuccess: () => {
      setRating(0);
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', pgId] });
      queryClient.invalidateQueries({ queryKey: ['pg', pgId] });
    },
  });

  const handleSubmit = () => {
    if (!rating || submitReview.isPending) return;
    const optimisticReview = {
      id: `temp-${Date.now()}`,
      user_email: user.email,
      user_name: user.full_name,
      pg_id: pgId,
      rating,
      comment,
      created_date: new Date().toISOString(),
    };
    submitReview.mutate({ optimisticReview });
  };

  return (
    <div>
      <h3 className="font-heading font-bold mb-3">Reviews ({reviews.length})</h3>

      {user && (
        <div className="bg-muted rounded-xl p-4 mb-4 space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`w-6 h-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write a review..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="bg-card"
            rows={2}
          />
          <Button size="sm" onClick={handleSubmit} disabled={!rating || submitReview.isPending}>
            <Send className="w-4 h-4 mr-1" />
            {submitReview.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map(review => (
          <div
            key={review.id}
            className={`bg-card rounded-xl p-4 border border-border transition-opacity ${review.id?.startsWith('temp-') ? 'opacity-60' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {review.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold">{review.user_name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">
                    {review.created_date ? format(new Date(review.created_date), 'MMM d, yyyy') : 'Just now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
                ))}
              </div>
            </div>
            {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
