import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Home,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

/* ------------------------------------------------------------------ */
/*  Route metadata: title, icon, breadcrumb segments                  */
/* ------------------------------------------------------------------ */
const routeMeta = {
  '/dashboard': {
    title: 'Dashboard',
    icon: LayoutDashboard,
    crumbs: ['Home', 'Dashboard'],
  },
  '/cases': {
    title: 'Cases',
    icon: FileText,
    crumbs: ['Home', 'Cases'],
  },
  '/statutes': {
    title: 'IPC / BNS Statutes',
    icon: BookOpen,
    crumbs: ['Home', 'Statutes'],
  },
  '/audit': {
    title: 'Audit Trail',
    icon: ClipboardList,
    crumbs: ['Home', 'Audit'],
  },
  '/chat': {
    title: 'AI Chat',
    icon: MessageSquare,
    crumbs: ['Home', 'Chat'],
  },
};

function resolveRoute(pathname) {
  // Exact match first
  if (routeMeta[pathname]) return routeMeta[pathname];

  // Dynamic case detail route  e.g. /cases/:id
  if (pathname.startsWith('/cases/')) {
    return {
      title: 'Case Details',
      icon: FileText,
      crumbs: ['Home', 'Cases', 'Case Details'],
    };
  }

  // Fallback
  return {
    title: 'NyayaAI',
    icon: Home,
    crumbs: ['Home'],
  };
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb link map (crumb label -> route)                        */
/* ------------------------------------------------------------------ */
const crumbLink = {
  Home: '/dashboard',
  Dashboard: '/dashboard',
  Cases: '/cases',
  Statutes: '/statutes',
  Audit: '/audit',
  Chat: '/chat',
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */
const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const childStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const childFade = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Header component                                                  */
/* ------------------------------------------------------------------ */
export default function Header() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { title, icon: PageIcon, crumbs } = resolveRoute(pathname);

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: 'relative',
        zIndex: 20,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Gradient accent line */}
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(to right, #6366f1, #a855f7, #3b82f6)',
        }}
      />

      {/* Glass bar */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '14px',
          paddingBottom: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* ---------- Left: breadcrumb + title ---------- */}
          <motion.div
            variants={childStagger}
            initial="hidden"
            animate="visible"
            style={{ minWidth: 0 }}
          >
            {/* Breadcrumbs */}
            <motion.nav
              variants={childFade}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#94a3b8',
                marginBottom: '4px',
              }}
              aria-label="Breadcrumb"
            >
              {crumbs.map((crumb, idx) => {
                const isLast = idx === crumbs.length - 1;
                const link = crumbLink[crumb];

                return (
                  <span
                    key={crumb}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {idx > 0 && (
                      <ChevronRight
                        style={{ width: '12px', height: '12px', color: '#cbd5e1' }}
                        strokeWidth={2}
                      />
                    )}

                    {isLast ? (
                      <span
                        style={{
                          color: '#6366f1',
                          fontWeight: 600,
                          letterSpacing: '0.025em',
                        }}
                      >
                        {crumb}
                      </span>
                    ) : link ? (
                      <Link
                        to={link}
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                          transition: 'color 150ms',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                      >
                        {crumb}
                      </Link>
                    ) : (
                      <span>{crumb}</span>
                    )}
                  </span>
                );
              })}
            </motion.nav>

            {/* Page title with icon */}
            <motion.div
              variants={childFade}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background:
                    'linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                <PageIcon
                  style={{ width: '16px', height: '16px', color: '#4f46e5' }}
                  strokeWidth={2}
                />
              </div>

              <h1
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.25,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}
              >
                {title}
              </h1>
            </motion.div>
          </motion.div>

          {/* ---------- Right: greeting + AI status ---------- */}
          <motion.div
            variants={childStagger}
            initial="hidden"
            animate="visible"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexShrink: 0,
            }}
          >
            {/* Greeting */}
            <motion.p
              variants={childFade}
              style={{
                fontSize: '14px',
                color: '#64748b',
                fontWeight: 500,
                margin: 0,
              }}
            >
              Hey,{' '}
              <span style={{ color: '#334155', fontWeight: 600 }}>{firstName}</span>
            </motion.p>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: 'rgba(226, 232, 240, 0.8)',
                borderRadius: '9999px',
              }}
            />

            {/* AI status badge */}
            <motion.div
              variants={childFade}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingLeft: '12px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(236, 253, 245, 0.8)',
                border: '1px solid rgba(167, 243, 208, 0.5)',
              }}
            >
              {/* Pulsing green dot */}
              <span
                style={{
                  position: 'relative',
                  display: 'flex',
                  height: '8px',
                  width: '8px',
                }}
              >
                <span
                  className="animate-ping"
                  style={{
                    position: 'absolute',
                    display: 'inline-flex',
                    height: '100%',
                    width: '100%',
                    borderRadius: '9999px',
                    backgroundColor: '#34d399',
                    opacity: 0.75,
                  }}
                />
                <span
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    borderRadius: '9999px',
                    height: '8px',
                    width: '8px',
                    backgroundColor: '#10b981',
                  }}
                />
              </span>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#047857',
                  letterSpacing: '0.025em',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Activity style={{ width: '12px', height: '12px' }} strokeWidth={2.2} />
                AI System Online
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
