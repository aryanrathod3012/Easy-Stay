import React, { useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageSquare, CalendarCheck, User, Building2, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const userNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/ai-assistant', icon: MessageSquare, label: 'AI' },
  { path: '/my-bookings', icon: CalendarCheck, label: 'Bookings' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const ownerNavItems = [
  { path: '/owner', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/owner/add-pg', icon: Building2, label: 'Add PG' },
  { path: '/owner/bookings', icon: CalendarCheck, label: 'Bookings' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/listings', icon: Building2, label: 'Listings' },
  { path: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { path: '/profile', icon: User, label: 'Profile' },
];

// Determine slide direction from previous → next path index
function getDirection(fromPath, toPath, navItems) {
  const fromIdx = navItems.findIndex(n => n.path === fromPath);
  const toIdx = navItems.findIndex(n => n.path === toPath);
  if (fromIdx === -1 || toIdx === -1) return 0;
  return toIdx > fromIdx ? 1 : -1;
}

const slideVariants = {
  enter: (dir) => ({ x: dir * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir * -60, opacity: 0 }),
};

export default function AppLayout({ userRole }) {
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  const navItems = userRole === 'admin' ? adminNavItems
    : userRole === 'owner' ? ownerNavItems
    : userNavItems;

  const direction = getDirection(prevPath.current, location.pathname, navItems);
  // Update after computing direction
  React.useLayoutEffect(() => {
    prevPath.current = location.pathname;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
