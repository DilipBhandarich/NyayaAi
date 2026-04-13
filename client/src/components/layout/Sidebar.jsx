import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  ClipboardList,
  Scale,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/cases', label: 'Cases', icon: FileText },
  { to: '/statutes', label: 'IPC/BNS Table', icon: BookOpen },
  { to: '/audit', label: 'Audit Trail', icon: ClipboardList },
];

function NavItem({ item }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={item.to}
      style={{ display: 'block', position: 'relative', textDecoration: 'none' }}
    >
      {({ isActive: linkActive }) => (
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ position: 'relative' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Active background indicator with layoutId for smooth transitions */}
          <AnimatePresence>
            {linkActive && (
              <motion.div
                layoutId="activeTab"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #4f46e5, #2563eb)',
                  boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 350,
                  damping: 30,
                }}
              />
            )}
          </AnimatePresence>

          {/* Active left accent bar */}
          <AnimatePresence>
            {linkActive && (
              <motion.div
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '6px',
                  bottom: '6px',
                  width: '3px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              />
            )}
          </AnimatePresence>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              paddingLeft: '16px',
              paddingRight: '16px',
              paddingTop: '12px',
              paddingBottom: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'color 200ms, background-color 200ms',
              color: linkActive
                ? '#ffffff'
                : hovered
                  ? '#e2e8f0'
                  : '#94a3b8',
              backgroundColor:
                !linkActive && hovered
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'transparent',
            }}
          >
            <Icon
              style={{
                width: '18px',
                height: '18px',
                flexShrink: 0,
              }}
              strokeWidth={linkActive ? 2.2 : 1.8}
            />
            <span style={{ flex: 1 }}>{item.label}</span>
            <ChevronRight
              style={{
                width: '16px',
                height: '16px',
                transition: 'all 200ms',
                opacity: linkActive ? 1 : 0,
                transform: linkActive ? 'translateX(0)' : 'translateX(-8px)',
              }}
              strokeWidth={2}
            />
          </div>
        </motion.div>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <aside
      style={{
        width: '280px',
        backgroundColor: '#020617',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Subtle gradient overlay on the sidebar */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(30, 27, 75, 0.2), transparent, #020617)',
          pointerEvents: 'none',
        }}
      />
      {/* Subtle radial glow at top */}
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '160px',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '9999px',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />

      {/* ======== Logo Area ======== */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo icon with gradient background */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.25)',
              }}
            >
              <Scale
                style={{ width: '20px', height: '20px', color: '#ffffff' }}
                strokeWidth={2.2}
              />
            </div>
            {/* AI pulse dot */}
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '9999px',
                backgroundColor: '#34d399',
                border: '2px solid #020617',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              className="gradient-text"
              style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              NyayaAI
            </h1>
            <p
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: '#64748b',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}
            >
              AI-Powered Legal Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* ======== Navigation ======== */}
      <nav
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingTop: '20px',
          paddingBottom: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            paddingLeft: '16px',
            marginBottom: '12px',
          }}
        >
          Navigation
        </p>
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            isActive={
              location.pathname === item.to ||
              location.pathname.startsWith(item.to + '/')
            }
          />
        ))}
      </nav>

      {/* ======== Divider ======== */}
      <div style={{ position: 'relative', zIndex: 10, marginLeft: '24px', marginRight: '24px' }}>
        <div
          style={{
            height: '1px',
            background:
              'linear-gradient(to right, transparent, rgba(51, 65, 85, 0.5), transparent)',
          }}
        />
      </div>

      {/* ======== User Section ======== */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '16px',
          paddingBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            transition: 'background-color 200ms',
          }}
        >
          {/* Avatar with gradient ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '9999px',
                padding: '2px',
                background:
                  'linear-gradient(to bottom right, #818cf8, #c084fc, #22d3ee)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '9999px',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#a5b4fc',
                  }}
                >
                  {userInitial}
                </span>
              </div>
            </div>
            {/* Online indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                borderRadius: '9999px',
                backgroundColor: '#34d399',
                border: '2px solid #020617',
              }}
            />
          </div>

          {/* Name and role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#e2e8f0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {user?.fullName || 'User'}
            </p>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: '4px',
                paddingLeft: '8px',
                paddingRight: '8px',
                paddingTop: '2px',
                paddingBottom: '2px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              {user?.role || 'Member'}
            </span>
          </div>
        </div>

        {/* Logout button */}
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            marginTop: '8px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingTop: '10px',
            paddingBottom: '10px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            color: logoutHovered ? '#f87171' : '#64748b',
            backgroundColor: logoutHovered
              ? 'rgba(239, 68, 68, 0.06)'
              : 'transparent',
            transition: 'all 200ms',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            background: logoutHovered
              ? 'rgba(239, 68, 68, 0.06)'
              : 'transparent',
            textAlign: 'left',
          }}
        >
          <LogOut
            style={{
              width: '16px',
              height: '16px',
              transition: 'transform 200ms',
              transform: logoutHovered ? 'translateX(-2px)' : 'translateX(0)',
            }}
            strokeWidth={1.8}
          />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
