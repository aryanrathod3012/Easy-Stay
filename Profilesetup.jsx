import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Eye, EyeOff, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ProfileSetup({ onComplete }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({
    phone: '',
    gender: '',
    pgName: '',
    pgAddress: ''
  });
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const phoneDigits = form.phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 10;

  const setField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const touch = (key) => setTouched(prev => ({ ...prev, [key]: true }));

  // Validation
  const phoneError = touched.phone && !phoneValid;

  const isUserValid = selectedRole === 'user' && phoneValid && form.gender;
  const isOwnerValid = selectedRole === 'owner' && phoneValid && form.pgName.trim() && form.pgAddress.trim();
  const formValid = isUserValid || isOwnerValid;

  const handleSubmit = async () => {
    // Touch all fields to show errors
    setTouched({ phone: true });

    if (!selectedRole) {
      toast({ title: 'Please select a role', variant: 'destructive' });
      return;
    }
    if (!phoneValid) {
      console.log('[ProfileSetup] Validation failed: phone invalid', phoneDigits.length);
      toast({ title: 'Invalid phone number', description: 'Enter exactly 10 digits', variant: 'destructive' });
      return;
    }
    if (selectedRole === 'user' && !form.gender) {
      toast({ title: 'Please select your gender', variant: 'destructive' });
      return;
    }
    if (selectedRole === 'owner' && !form.pgName.trim()) {
      toast({ title: 'Please enter your PG/Hostel name', variant: 'destructive' });
      return;
    }
    if (selectedRole === 'owner' && !form.pgAddress.trim()) {
      toast({ title: 'Please enter your PG/Hostel address', variant: 'destructive' });
      return;
    }

    console.log('[ProfileSetup] Submitting profile for role:', selectedRole);
    setSaving(true);

    const data = {
      role: selectedRole,
      phone: phoneDigits,
      profile_complete: true,
      ...(selectedRole === 'user' ? { gender: form.gender } : {}),
      ...(selectedRole === 'owner' ? { pg_name: form.pgName, pg_address: form.pgAddress } : {})
    };

    console.log('[ProfileSetup] Calling updateMe with:', data);
    await base44.auth.updateMe(data);
    console.log('[ProfileSetup] Profile saved successfully');

    setSaving(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex flex-col items-center justify-start px-4 pt-10 pb-8 overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl font-heading font-black text-white">ES</span>
          </div>
          <h1 className="text-3xl font-heading font-bold">Easy Stay</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Indian's 1st PG & Hostel Finder</p>
          <p className="text-muted-foreground text-xs mt-2">Complete your profile to get started</p>
        </div>

        {/* Role Selection */}
        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div key="role" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-center font-semibold text-foreground">I am a...</p>
              <button
                onClick={() => { console.log('[ProfileSetup] Role selected: user'); setSelectedRole('user'); }}
                className="w-full py-5 rounded-2xl border-2 border-primary bg-primary text-primary-foreground text-lg font-bold flex items-center justify-center gap-3 shadow-md active:scale-95 transition-transform"
              >
                <User className="w-6 h-6" /> User / Tenant
              </button>
              <button
                onClick={() => { console.log('[ProfileSetup] Role selected: owner'); setSelectedRole('owner'); }}
                className="w-full py-5 rounded-2xl border-2 border-border bg-card text-foreground text-lg font-bold flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-transform hover:border-primary/50"
              >
                <Building2 className="w-6 h-6" /> PG / Hostel Owner
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card rounded-3xl shadow-lg border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => { setSelectedRole(''); setTouched({}); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</button>
                <span className="text-sm font-semibold text-muted-foreground ml-auto">
                  {selectedRole === 'user' ? '👤 User Profile' : '🏢 Owner Profile'}
                </span>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-sm">Phone Number <span className="text-red-500">*</span> (10 digits)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                  <div className="absolute left-[3.2rem] top-1/2 -translate-y-1/2 h-4 w-px bg-border" />
                  <Input
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={e => { setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10)); touch('phone'); }}
                    onBlur={() => touch('phone')}
                    inputMode="numeric"
                    maxLength={10}
                    className={`pl-[3.8rem] h-12 rounded-xl font-mono tracking-wider ${phoneError ? 'border-red-500 ring-1 ring-red-500' : touched.phone && phoneValid ? 'border-green-500 ring-1 ring-green-500' : ''}`}
                  />
                  {touched.phone && phoneValid && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
                </div>
                <AnimatePresence>
                  {phoneError && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Invalid phone number — enter exactly 10 digits ({phoneDigits.length}/10)
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Gender — only for users */}
              {selectedRole === 'user' && (
                <div className="space-y-1.5">
                  <Label className="font-semibold text-sm">Gender <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ val: 'male', label: '👨 Male' }, { val: 'female', label: '👩 Female' }].map(g => (
                      <button key={g.val} onClick={() => setField('gender', g.val)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${form.gender === g.val ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner extra fields */}
              {selectedRole === 'owner' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">PG / Hostel Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. Shivam Boys PG"
                      value={form.pgName}
                      onChange={e => setField('pgName', e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-sm">PG / Hostel Address <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Full address with city"
                      value={form.pgAddress}
                      onChange={e => setField('pgAddress', e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full h-13 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity"
              >
                {saving ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</span>
                ) : (
                  <span className="flex items-center gap-2">🚀 Get Started <ChevronRight className="w-4 h-4" /></span>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to Easy Stay's Terms & Conditions
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
