import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import MobileSelect from '@/components/ui/MobileSelect';

const GUJARAT_CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Nadiad', 'Mehsana'];

export default function FilterBar({ filters, setFilters, userGender }) {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(filters.maxPrice || 20000);

  const applyFilters = () => {
    setFilters(prev => ({ ...prev, maxPrice: budget }));
    setOpen(false);
  };

  const clearFilters = () => {
    setFilters({ genderType: '', maxPrice: null, roomType: '', sortBy: 'rating', city: '' });
    setBudget(20000);
  };

  const hasActiveFilters = filters.maxPrice || filters.roomType || filters.city || filters.genderType;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full flex-shrink-0 gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="font-heading">Filters</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="font-semibold">Budget (₹{budget.toLocaleString()}/month)</Label>
              <Slider value={[budget]} onValueChange={v => setBudget(v[0])} min={1000} max={30000} step={500} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹1,000</span><span>₹30,000</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="font-semibold">Room Type</Label>
              <MobileSelect
                value={filters.roomType}
                onValueChange={v => setFilters(prev => ({ ...prev, roomType: v }))}
                placeholder="All types"
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'double', label: 'Double' },
                  { value: 'triple', label: 'Triple' },
                  { value: 'dormitory', label: 'Dormitory' },
                ]}
              />
            </div>
            <div className="space-y-3">
              <Label className="font-semibold">City in Gujarat</Label>
              <MobileSelect
                value={filters.city || ''}
                onValueChange={v => setFilters(prev => ({ ...prev, city: v }))}
                placeholder="All cities"
                options={GUJARAT_CITIES.map(c => ({ value: c, label: c }))}
              />
            </div>
            <div className="space-y-3">
              <Label className="font-semibold">Sort By</Label>
              <MobileSelect
                value={filters.sortBy || 'rating'}
                onValueChange={v => setFilters(prev => ({ ...prev, sortBy: v }))}
                placeholder="Sort by"
                options={[
                  { value: 'rating', label: 'Top Rated' },
                  { value: 'price_low', label: 'Price: Low to High' },
                  { value: 'price_high', label: 'Price: High to Low' },
                ]}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearFilters} className="flex-1">Clear</Button>
              <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {['boys', 'girls', 'unisex'].map(g => (
        <Button
          key={g}
          variant={filters.genderType === g ? 'default' : 'outline'}
          size="sm"
          className="rounded-full capitalize flex-shrink-0"
          onClick={() => setFilters(prev => ({ ...prev, genderType: prev.genderType === g ? '' : g }))}
        >
          {g === 'boys' ? '👦 Boys' : g === 'girls' ? '👧 Girls' : '🏠 Unisex'}
        </Button>
      ))}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="rounded-full flex-shrink-0 text-destructive" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />Clear
        </Button>
      )}
    </div>
  );
}
