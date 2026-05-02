import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users, Wifi, Wind, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

const amenityIcons = { WiFi: Wifi, AC: Wind, Food: Utensils };

const genderColors = {
  boys: 'bg-blue-100 text-blue-700',
  girls: 'bg-pink-100 text-pink-700',
  unisex: 'bg-purple-100 text-purple-700',
};

export default function PGCard({ pg, index = 0 }) {
  const defaultImg = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/pg/${pg.id}`} className="block">
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow">
          <div className="relative h-44">
            <img
              src={pg.images?.[0] || defaultImg}
              alt={pg.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={`${genderColors[pg.gender_type]} border-0 font-semibold text-xs capitalize`}>
                <Users className="w-3 h-3 mr-1" />
                {pg.gender_type === 'boys' ? 'Boys' : pg.gender_type === 'girls' ? 'Girls' : 'Unisex'}
              </Badge>
            </div>
            {pg.average_rating > 0 && (
              <div className="absolute top-3 right-3 bg-black/60 text-white rounded-lg px-2 py-1 flex items-center gap-1 text-xs font-semibold backdrop-blur-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {pg.average_rating?.toFixed(1)}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-heading font-bold text-base truncate">{pg.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{pg.area || pg.city}</span>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {pg.amenities?.slice(0, 3).map(a => {
                const Icon = amenityIcons[a];
                return (
                  <span key={a} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {Icon && <Icon className="w-3 h-3" />}
                    {a}
                  </span>
                );
              })}
            </div>
            <div className="flex items-end justify-between mt-3">
              <div>
                <span className="text-xl font-heading font-bold text-primary">₹{pg.price_per_month?.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
              {pg.available_rooms > 0 && (
                <span className="text-xs text-accent font-medium">{pg.available_rooms} rooms left</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
