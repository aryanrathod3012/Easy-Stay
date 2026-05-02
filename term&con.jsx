import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, User, Building2 } from 'lucide-react';

const Highlight = ({ children }) => (
  <span className="bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded text-sm">{children}</span>
);

const RuleItem = ({ number, title, children }) => (
  <div className="mb-5">
    <div className="flex items-start gap-2 mb-1.5">
      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{number}</span>
      <h4 className="font-semibold text-sm text-foreground">{title}</h4>
    </div>
    <div className="ml-8 text-sm text-muted-foreground leading-relaxed space-y-1">{children}</div>
  </div>
);

const Bullet = ({ children, highlight }) => (
  <div className={`flex items-start gap-2 ${highlight ? 'text-foreground font-medium' : ''}`}>
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

export function TermsAndConditions({ agreed, onAgreeChange }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 bg-muted/40 border-b border-border">
        <h3 className="font-heading font-bold text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" /> Terms & Conditions
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Please read before using Easy Stay</p>
      </div>

      <Tabs defaultValue="user" className="w-full">
        <TabsList className="w-full rounded-none border-b border-border bg-muted/20 h-11">
          <TabsTrigger value="user" className="flex-1 gap-1.5 data-[state=active]:bg-background">
            <User className="w-3.5 h-3.5" /> User Rules
          </TabsTrigger>
          <TabsTrigger value="owner" className="flex-1 gap-1.5 data-[state=active]:bg-background">
            <Building2 className="w-3.5 h-3.5" /> Owner Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="m-0">
          <ScrollArea className="h-72 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Terms & Conditions for Users</p>

            <RuleItem number="1" title="Account Responsibility">
              <Bullet>Provide accurate and complete information during registration.</Bullet>
              <Bullet>You are responsible for maintaining account security.</Bullet>
            </RuleItem>

            <RuleItem number="2" title="Gender-Based Access Policy">
              <Bullet highlight>Male → Boys / Unisex PG only</Bullet>
              <Bullet highlight>Female → Girls / Unisex PG only</Bullet>
              <Bullet>Booking a PG that does not match your gender is not allowed.</Bullet>
            </RuleItem>

            <RuleItem number="3" title="Booking & Payment">
              <Bullet>All bookings must be made through Easy Stay platform.</Bullet>
              <Bullet>Full payment is required to confirm booking.</Bullet>
            </RuleItem>

            <RuleItem number="4" title="Cancellation Policy">
              <Badge variant="outline" className="text-xs mb-2 border-primary/30 text-primary">Important</Badge>
              <Bullet highlight>Within 48 hours → 100% refund</Bullet>
              <Bullet highlight>After 48 hours → No refund</Bullet>
            </RuleItem>

            <RuleItem number="5" title="Property Rules Compliance">
              <Bullet>Follow all PG/hostel rules including timings, guest policies, and facility usage.</Bullet>
            </RuleItem>

            <RuleItem number="6" title="Reviews & Feedback">
              <Bullet>Provide genuine reviews only.</Bullet>
              <Bullet>Fake or abusive reviews are strictly not allowed.</Bullet>
            </RuleItem>

            <RuleItem number="7" title="Prohibited Activities">
              <Bullet>Fake bookings</Bullet>
              <Bullet>Misuse of platform</Bullet>
              <Bullet>Harassment or illegal activity</Bullet>
              <p className="text-xs text-destructive font-medium mt-1">⚠️ Violation may result in account suspension or permanent ban.</p>
            </RuleItem>

            <RuleItem number="8" title="Platform Role">
              <Bullet>Easy Stay acts as a middleman between users and property owners and ensures transparency.</Bullet>
            </RuleItem>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="owner" className="m-0">
          <ScrollArea className="h-72 p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Terms & Conditions for PG/Hostel Owners</p>

            <RuleItem number="1" title="Listing Transparency">
              <Bullet>Clearly declare: Rent, Deposit, Food charges, Electricity charges.</Bullet>
              <Bullet highlight>Hidden charges are strictly prohibited.</Bullet>
            </RuleItem>

            <RuleItem number="2" title="Rules Declaration">
              <Bullet>Define entry/exit timing, guest policy, food availability, and house rules.</Bullet>
            </RuleItem>

            <RuleItem number="3" title="Gender Specification">
              <Bullet>Correctly specify: Boys / Girls / Unisex.</Bullet>
              <Bullet highlight>Misleading information is not allowed.</Bullet>
            </RuleItem>

            <RuleItem number="4" title="Booking & Commission">
              <Badge variant="outline" className="text-xs mb-2 border-primary/30 text-primary">Important</Badge>
              <Bullet>All bookings must go through Easy Stay.</Bullet>
              <Bullet highlight>Platform charges 2% commission per booking.</Bullet>
              <div className="bg-primary/5 rounded-lg p-2 mt-2 text-xs">
                Example: ₹5000 booking → <Highlight>₹100 commission</Highlight> → ₹4900 to owner
              </div>
            </RuleItem>

            <RuleItem number="5" title="Payment Release Policy">
              <Badge variant="outline" className="text-xs mb-2 border-orange-500/30 text-orange-600">48hr Policy</Badge>
              <Bullet highlight>Payment released after 48 hours.</Bullet>
              <Bullet>If user cancels within 48 hours, payment will not be released.</Bullet>
            </RuleItem>

            <RuleItem number="6" title="Cancellation Compliance">
              <Bullet>Must accept cancellations within 48 hours and cannot deny refunds.</Bullet>
            </RuleItem>

            <RuleItem number="7" title="Service Quality">
              <Bullet>Maintain hygiene, safety, and proper facilities at all times.</Bullet>
            </RuleItem>

            <RuleItem number="8" title="Prohibited Activities">
              <Bullet>Fake listings, Misleading photos</Bullet>
              <Bullet>Hidden charges, Misconduct</Bullet>
              <p className="text-xs text-destructive font-medium mt-1">⚠️ Violation leads to listing removal or account suspension.</p>
            </RuleItem>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t border-border bg-muted/20">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => onAgreeChange(e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm font-medium flex items-center gap-2">
            {agreed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            I agree to Terms & Conditions
          </span>
        </label>
      </div>
    </div>
  );
}
