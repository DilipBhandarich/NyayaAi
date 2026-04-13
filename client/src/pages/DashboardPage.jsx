import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Siren,
  Building2,
  Plus,
  BookOpen,
  ClipboardList,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { dashboardApi } from '../api/dashboard.api.js';
import Spinner from '../components/ui/Spinner.jsx';

/* ─── status badge styles (actual CSS values) ─── */
const statusBadgeStyles = {
  filed:             { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#93c5fd' },
  under_review:      { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fde047' },
  analysis_pending:  { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#d8b4fe' },
  analysis_complete: { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' },
  judgment_pending:  { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fde047' },
  closed:            { backgroundColor: '#f3f4f6', color: '#4b5563', borderColor: '#d1d5db' },
};

const typeBadgeStyles = {
  criminal: { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' },
  civil:    { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#d8b4fe' },
};

/* ─── inline badge component ─── */
function InlineBadge({ badgeStyle, children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        border: '1px solid',
        lineHeight: '1.25rem',
        textTransform: 'capitalize',
        ...badgeStyle,
      }}
    >
      {children}
    </span>
  );
}

/* ─── animated counter ─── */
function AnimatedNumber({ value, duration = 1.2 }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: 'easeOut',
    });
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, motionVal, rounded]);

  return <span>{display}</span>;
}

/* ─── stat card definitions (CSS values, not Tailwind) ─── */
const buildStatCards = (stats) => [
  {
    label: 'Total Cases',
    value: stats.totalCases,
    icon: Briefcase,
    gradient: 'linear-gradient(to bottom right, #6366f1, #4338ca)',
    textColor: '#4338ca',
    badgeBg: '#eef2ff',
    accentGradient: 'linear-gradient(to right, #6366f1, #4338ca)',
  },
  {
    label: 'Pending Analysis',
    value: stats.pendingAnalysis,
    icon: Clock,
    gradient: 'linear-gradient(to bottom right, #f59e0b, #d97706)',
    textColor: '#b45309',
    badgeBg: '#fffbeb',
    accentGradient: 'linear-gradient(to right, #f59e0b, #d97706)',
  },
  {
    label: 'Analysis Complete',
    value: stats.completedAnalysis,
    icon: CheckCircle2,
    gradient: 'linear-gradient(to bottom right, #10b981, #059669)',
    textColor: '#047857',
    badgeBg: '#ecfdf5',
    accentGradient: 'linear-gradient(to right, #10b981, #059669)',
  },
  {
    label: 'Criminal Cases',
    value: stats.criminalCases,
    icon: Siren,
    gradient: 'linear-gradient(to bottom right, #ef4444, #dc2626)',
    textColor: '#b91c1c',
    badgeBg: '#fef2f2',
    accentGradient: 'linear-gradient(to right, #ef4444, #dc2626)',
  },
  {
    label: 'Civil Cases',
    value: stats.civilCases,
    icon: Building2,
    gradient: 'linear-gradient(to bottom right, #a855f7, #7c3aed)',
    textColor: '#6d28d9',
    badgeBg: '#faf5ff',
    accentGradient: 'linear-gradient(to right, #a855f7, #7c3aed)',
  },
];

/* ─── quick-action definitions (CSS values, not Tailwind) ─── */
const quickActions = [
  {
    label: 'Create New Case',
    to: '/cases',
    icon: Plus,
    gradient: 'linear-gradient(to bottom right, #4f46e5, #2563eb)',
    description: 'Start a new legal case file',
  },
  {
    label: 'IPC/BNS Lookup',
    to: '/statutes',
    icon: BookOpen,
    gradient: 'linear-gradient(to bottom right, #7c3aed, #9333ea)',
    description: 'Search statutes & sections',
  },
  {
    label: 'View Audit Trail',
    to: '/audit',
    icon: ClipboardList,
    gradient: 'linear-gradient(to bottom right, #0284c7, #0891b2)',
    description: 'Review activity history',
  },
];

/* ─── reusable glass-card style ─── */
const glassCard = {
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  borderRadius: '1rem',
};

/* ─── framer variants ─── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then((data) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── loading state ── */
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <Spinner size="lg" />
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', letterSpacing: '0.025em' }}>
            Loading dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── error state ── */
  if (!stats) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...glassCard,
            padding: '2rem 2.5rem',
            textAlign: 'center',
          }}
        >
          <FolderOpen
            style={{
              margin: '0 auto',
              height: '2.5rem',
              width: '2.5rem',
              color: '#d1d5db',
              marginBottom: '0.75rem',
            }}
          />
          <p style={{ color: '#64748b', fontWeight: 500 }}>Failed to load dashboard.</p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Please try refreshing the page.
          </p>
        </motion.div>
      </div>
    );
  }

  const statCards = buildStatCards(stats);

  /* ══════════════════════ RENDER ══════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* ── page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.025em',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Welcome back. Here is an overview of your case portfolio.
        </p>
      </motion.div>

      {/* ─────────────────── STAT CARDS ─────────────────── */}
      <motion.div
        className="grid-stats"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              variants={cardVariants}
              whileHover={{
                scale: 1.02,
                boxShadow:
                  '0 20px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.6)',
              }}
              style={{
                ...glassCard,
                padding: '1.25rem',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: s.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                  }}
                >
                  <Icon style={{ width: '1.5rem', height: '1.5rem', color: '#ffffff' }} strokeWidth={2} />
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: s.textColor,
                    backgroundColor: s.badgeBg,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p
                  style={{
                    fontSize: '1.875rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <AnimatedNumber value={s.value ?? 0} />
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    marginTop: '0.25rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {s.label}
                </p>
              </div>
              {/* subtle accent bar */}
              <div
                style={{
                  height: '4px',
                  width: '3.5rem',
                  borderRadius: '9999px',
                  background: s.accentGradient,
                  marginTop: '1rem',
                  opacity: 0.6,
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─────────────────── QUICK ACTIONS ─────────────────── */}
      <motion.div
        className="grid-actions"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.label} variants={cardVariants}>
              <Link to={action.to} style={{ display: 'block', textDecoration: 'none' }}>
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 20px 40px -12px rgba(79,70,229,0.15)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    ...glassCard,
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '2.75rem',
                      height: '2.75rem',
                      borderRadius: '0.75rem',
                      background: action.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#ffffff' }} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#0f172a',
                        fontSize: '0.875rem',
                      }}
                    >
                      {action.label}
                    </p>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight
                    style={{
                      width: '1rem',
                      height: '1rem',
                      color: '#d1d5db',
                      flexShrink: 0,
                    }}
                  />
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─────────────────── RECENT CASES TABLE ─────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        style={{
          ...glassCard,
          overflow: 'hidden',
        }}
      >
        {/* header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '4px',
              height: '1.5rem',
              borderRadius: '9999px',
              background: 'linear-gradient(to bottom, #4f46e5, #2563eb)',
            }}
          />
          <h3
            style={{
              fontWeight: 600,
              color: '#0f172a',
              fontSize: '1.125rem',
              letterSpacing: '-0.025em',
            }}
          >
            Recent Cases
          </h3>
        </div>

        {/* table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  borderTop: '1px solid #f3f4f6',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: 'rgba(249,250,251,0.6)',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>
                  Case Number
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>
                  Title
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>
                  Type
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>
                  Status
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600 }}>
                  Date
                </th>
              </tr>
            </thead>

            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {stats.recentCases && stats.recentCases.length > 0 ? (
                stats.recentCases.map((c) => (
                  <motion.tr
                    key={c._id}
                    variants={rowVariants}
                    style={{ borderBottom: '1px solid rgba(243,244,246,0.8)' }}
                    whileHover={{ backgroundColor: 'rgba(238,242,255,0.5)' }}
                  >
                    <td style={{ padding: '0.875rem 1.5rem' }}>
                      <Link
                        to={`/cases/${c._id}`}
                        style={{
                          color: '#4f46e5',
                          fontWeight: 600,
                          textDecoration: 'none',
                          transition: 'color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#3730a3';
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#4f46e5';
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td
                      style={{
                        padding: '0.875rem 1.5rem',
                        color: '#334155',
                        maxWidth: '20rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.title}
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem' }}>
                      <InlineBadge
                        badgeStyle={typeBadgeStyles[c.caseType] || typeBadgeStyles.civil}
                      >
                        {c.caseType}
                      </InlineBadge>
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem' }}>
                      <InlineBadge
                        badgeStyle={statusBadgeStyles[c.status] || statusBadgeStyles.closed}
                      >
                        {c.status?.replace(/_/g, ' ')}
                      </InlineBadge>
                    </td>
                    <td
                      style={{
                        padding: '0.875rem 1.5rem',
                        color: '#9ca3af',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr variants={rowVariants}>
                  <td
                    colSpan={5}
                    style={{ padding: '4rem 1.5rem', textAlign: 'center' }}
                  >
                    <FolderOpen
                      style={{
                        margin: '0 auto',
                        height: '2.5rem',
                        width: '2.5rem',
                        color: '#e5e7eb',
                        marginBottom: '0.75rem',
                      }}
                    />
                    <p style={{ color: '#9ca3af', fontWeight: 500 }}>No cases yet</p>
                    <p style={{ color: '#d1d5db', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      Create your first case to get started.
                    </p>
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
