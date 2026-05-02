/**
 * LocationSearchBar — real-time location autocomplete using Nominatim (OpenStreetMap).
 * No API key required. Debounces requests and shows a dropdown of suggestions.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

export default function LocationSearchBar({ value, onChange, onSelect, placeholder = 'Search by location, area, city...', className = '' }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Sync external value
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}+India&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    onChange?.(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 350);
  };

  const handleSelect = (suggestion) => {
    // Build a readable label: use suburb, city_district, city, state
    const addr = suggestion.address || {};
    const parts = [
      addr.suburb || addr.neighbourhood || addr.quarter,
      addr.city_district,
      addr.city || addr.town || addr.village,
      addr.state,
    ].filter(Boolean);
    const label = parts.length > 0 ? parts.slice(0, 3).join(', ') : suggestion.display_name.split(',').slice(0, 2).join(',').trim();

    setQuery(label);
    onChange?.(label);
    onSelect?.({ label, lat: parseFloat(suggestion.lat), lon: parseFloat(suggestion.lon), address: suggestion.address });
    setSuggestions([]);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    onSelect?.(null);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-10 rounded-xl border border-input bg-card text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {loading && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
          {!loading && query && (
            <button onClick={handleClear} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => {
            const addr = s.address || {};
            const line1 = [addr.suburb || addr.neighbourhood, addr.city_district, addr.city || addr.town || addr.village].filter(Boolean).join(', ');
            const line2 = addr.state;
            return (
              <button
                key={s.place_id}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted text-left transition-colors border-b border-border last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{line1 || s.display_name.split(',')[0]}</p>
                  {line2 && <p className="text-xs text-muted-foreground truncate">{line2}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
