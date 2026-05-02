import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Send, MapPin, IndianRupee, Bot, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import PGCard from '@/components/pg/PGCard';

export default function AIAssistant() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setMessages([{
        role: 'assistant',
        content: `Hi ${u.full_name?.split(' ')[0] || 'there'}! 👋 I'm your Easy Stay AI assistant. Tell me your preferences and I'll find the best PGs for you.\n\nFor example: "Find me a PG in Koramangala under ₹8000 with WiFi and food"`,
      }]);
    }).catch(() => {});
  }, []);

  const { data: allPGs = [] } = useQuery({
    queryKey: ['all-pgs-ai'],
    queryFn: () => base44.entities.PGListing.filter({ status: 'approved' }),
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Strict keyword-based gender intent detection
  const detectGenderIntent = (text) => {
    const t = text.toLowerCase();
    if (/girls?|female|ladies|woman|women/.test(t)) return 'girls';
    if (/boys?|male|gents?|men(?!u)/.test(t)) return 'boys';
    if (/unisex|co.?living|mixed/.test(t)) return 'unisex';
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Detect explicit gender intent from the message (strict)
    const intentGender = detectGenderIntent(userMsg);

    // Apply strict gender filter: intent takes priority, no fallback to other categories
    const genderFiltered = intentGender
      ? allPGs.filter(pg => pg.gender_type === intentGender)
      : allPGs;

    const pgSummary = genderFiltered.map(pg => ({
      id: pg.id,
      title: pg.title,
      price: pg.price_per_month,
      area: pg.area,
      city: pg.city,
      gender: pg.gender_type,
      rating: pg.average_rating,
      amenities: pg.amenities,
      room_type: pg.room_type,
      available: pg.available_rooms,
    }));

    const intentLabel = intentGender ? `${intentGender.charAt(0).toUpperCase() + intentGender.slice(1)}-only` : 'any';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Easy Stay AI assistant. Help users find PGs/hostels.

User profile: gender=${user?.gender || 'not specified'}, city=${user?.city || 'unknown'}.
Detected gender intent from user's message: "${intentLabel}"

STRICT RULES:
- The PG list below is ALREADY filtered to only show "${intentLabel}" PGs.
- NEVER suggest, mention, or reference PGs of other gender categories.
- NEVER say "you can also check boys/unisex/girls PGs".
- NEVER broaden the search beyond what the user asked for.
- If the list is empty, say "No ${intentLabel} PGs found matching your criteria. Try adjusting your location or budget." — DO NOT suggest other gender types.

Available PGs (pre-filtered, ${genderFiltered.length} results):
${JSON.stringify(pgSummary, null, 2)}

User's message: "${userMsg}"

Recommend the top 5 best matching PGs based on:
- Location match
- Price affordability
- Rating
- Amenities match
- Room availability

Be friendly and concise. Only reference PGs from the list above.`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string", description: "Friendly response to user" },
          recommended_pg_ids: { type: "array", items: { type: "string" }, description: "Array of recommended PG IDs, top 5" }
        }
      }
    });

    const recommendedPGs = result.recommended_pg_ids
      ? genderFiltered.filter(pg => result.recommended_pg_ids.includes(pg.id))
      : [];

    setMessages(prev => [...prev, {
      role: 'assistant',
      content: result.message,
      pgs: recommendedPGs,
    }]);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Powered by AI recommendations</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div className={`rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border border-border rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.pgs?.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {msg.pgs.map((pg, j) => (
                      <PGCard key={pg.id} pg={pg} index={j} />
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <UserIcon className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-4">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. PG near Indiranagar under ₹7000..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="h-12 rounded-xl"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon" className="h-12 w-12 rounded-xl flex-shrink-0">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
