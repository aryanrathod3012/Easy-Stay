import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function PGChat({ pg, user }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  // conversation_id is stable: pg_id + tenant email (owner sees same thread)
  const tenantEmail = user?.role === 'owner' ? null : user?.email;
  // Owners see all conversations for their PG; but for simplicity we show
  // the conversation from the current user's perspective.
  const conversationId = `${pg.id}__${user?.email}`;

  const { data: messages = [] } = useQuery({
    queryKey: ['chat', conversationId],
    queryFn: () =>
      base44.entities.ChatMessage.filter({ conversation_id: conversationId }, 'created_date'),
    enabled: !!user && open,
    refetchInterval: open ? 5000 : false,
  });

  // Real-time subscription
  useEffect(() => {
    if (!open || !user) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;
      queryClient.setQueryData(['chat', conversationId], (old = []) => {
        if (event.type === 'create') {
          // avoid duplicates
          if (old.find(m => m.id === event.id)) return old;
          return [...old, event.data];
        }
        return old;
      });
    });
    return unsub;
  }, [open, user, conversationId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMutation = useMutation({
    mutationFn: async (msg) => {
      await base44.entities.ChatMessage.create({
        pg_id: pg.id,
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_role: user.role === 'owner' ? 'owner' : 'user',
        text: msg,
      });
    },
    onMutate: async (msg) => {
      const optimistic = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_role: user.role === 'owner' ? 'owner' : 'user',
        text: msg,
        created_date: new Date().toISOString(),
      };
      queryClient.setQueryData(['chat', conversationId], (old = []) => [...old, optimistic]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', conversationId] });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText('');
    sendMutation.mutate(trimmed);
  };

  const isOwner = user?.role === 'owner';
  const isMyPG = isOwner && pg.owner_email === user?.email;

  // Only show chat to: tenants (not owner) or the owner of this PG
  if (!user || (isOwner && !isMyPG)) return null;

  return (
    <>
      {/* Floating chat button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-36 right-5 z-50 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl flex flex-col"
            style={{ height: '65vh', maxWidth: '512px', margin: '0 auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-heading font-bold text-base">Chat with {isOwner ? 'Tenant' : 'Owner'}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[220px]">{pg.title}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
                  <MessageCircle className="w-10 h-10 opacity-30" />
                  <p className="text-sm">
                    {isOwner ? 'Tenants can message you here about availability.' : `Ask ${pg.owner_name || 'the owner'} about availability & rules.`}
                  </p>
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender_email === user.email;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    } ${msg.id?.startsWith('temp-') ? 'opacity-70' : ''}`}>
                      {!isMine && (
                        <p className="text-[10px] font-semibold mb-1 opacity-60 uppercase tracking-wide">
                          {msg.sender_role === 'owner' ? 'Owner' : 'Tenant'}
                        </p>
                      )}
                      <p className="leading-snug">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {msg.created_date ? format(new Date(msg.created_date), 'h:mm a') : 'Sending…'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border flex items-end gap-2"
              style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground max-h-24"
                style={{ overflow: 'auto' }}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!text.trim() || sendMutation.isPending}
                className="h-10 w-10 rounded-xl flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
