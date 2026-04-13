import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Zap,
  AlertCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  Shield,
  LogIn,
  LogOut,
  Search as SearchIcon,
  Upload,
  Eye,
  BookOpen,
} from 'lucide-react';
import * as auditApi from '../api/audit.api.js';
import Spinner from '../components/ui/Spinner.jsx';

const ACTION_LABELS = {
  case_created: 'Case Created',
  case_updated: 'Case Updated',
  case_deleted: 'Case Deleted',
  analysis_triggered: 'Analysis Started',
  analysis_completed: 'Analysis Completed',
  analysis_failed: 'Analysis Failed',
  prediction_viewed: 'Prediction Viewed',
  prediction_generated: 'Prediction Generated',
  document_uploaded: 'Document Uploaded',
  chat_message_sent: 'Chat Message Sent',
  chat_response_received: 'AI Response',
  similar_cases_searched: 'Similar Cases Searched',
  bail_assessment_generated: 'Bail Assessment',
  statute_lookup: 'Statute Lookup',
  pdf_exported: 'PDF Exported',
  login: 'Login',
  logout: 'Logout',
};

/* ── Inline-style-based action styling ── */
const ACTION_STYLES = {
  case_created:              { dot: '#10b981', badge: { background: 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(34,197,94,0.15))', color: '#047857', borderColor: 'rgba(167,243,208,0.5)' }, icon: CheckCircle2 },
  case_updated:              { dot: '#34d399', badge: { background: 'linear-gradient(to right, rgba(16,185,129,0.15), rgba(34,197,94,0.15))', color: '#047857', borderColor: 'rgba(167,243,208,0.5)' }, icon: CheckCircle2 },
  case_deleted:              { dot: '#f87171', badge: { background: 'linear-gradient(to right, rgba(239,68,68,0.15), rgba(244,63,94,0.15))', color: '#b91c1c', borderColor: 'rgba(254,202,202,0.5)' }, icon: AlertCircle },
  analysis_triggered:        { dot: '#60a5fa', badge: { background: 'linear-gradient(to right, rgba(59,130,246,0.15), rgba(99,102,241,0.15))', color: '#1d4ed8', borderColor: 'rgba(191,219,254,0.5)' }, icon: Zap },
  analysis_completed:        { dot: '#3b82f6', badge: { background: 'linear-gradient(to right, rgba(59,130,246,0.15), rgba(99,102,241,0.15))', color: '#1d4ed8', borderColor: 'rgba(191,219,254,0.5)' }, icon: CheckCircle2 },
  analysis_failed:           { dot: '#ef4444', badge: { background: 'linear-gradient(to right, rgba(239,68,68,0.15), rgba(244,63,94,0.15))', color: '#b91c1c', borderColor: 'rgba(254,202,202,0.5)' }, icon: AlertCircle },
  prediction_viewed:         { dot: '#a78bfa', badge: { background: 'linear-gradient(to right, rgba(139,92,246,0.15), rgba(168,85,247,0.15))', color: '#6d28d9', borderColor: 'rgba(221,214,254,0.5)' }, icon: Eye },
  prediction_generated:      { dot: '#8b5cf6', badge: { background: 'linear-gradient(to right, rgba(139,92,246,0.15), rgba(168,85,247,0.15))', color: '#6d28d9', borderColor: 'rgba(221,214,254,0.5)' }, icon: Zap },
  document_uploaded:         { dot: '#fbbf24', badge: { background: 'linear-gradient(to right, rgba(245,158,11,0.15), rgba(234,179,8,0.15))', color: '#b45309', borderColor: 'rgba(253,230,138,0.5)' }, icon: Upload },
  chat_message_sent:         { dot: '#06b6d4', badge: { background: 'linear-gradient(to right, rgba(6,182,212,0.15), rgba(14,165,233,0.15))', color: '#0e7490', borderColor: 'rgba(165,243,252,0.5)' }, icon: MessageSquare },
  chat_response_received:    { dot: '#22d3ee', badge: { background: 'linear-gradient(to right, rgba(6,182,212,0.15), rgba(14,165,233,0.15))', color: '#0e7490', borderColor: 'rgba(165,243,252,0.5)' }, icon: MessageSquare },
  similar_cases_searched:    { dot: '#818cf8', badge: { background: 'linear-gradient(to right, rgba(99,102,241,0.15), rgba(59,130,246,0.15))', color: '#4338ca', borderColor: 'rgba(199,210,254,0.5)' }, icon: SearchIcon },
  bail_assessment_generated: { dot: '#a855f7', badge: { background: 'linear-gradient(to right, rgba(168,85,247,0.15), rgba(217,70,239,0.15))', color: '#7e22ce', borderColor: 'rgba(233,213,255,0.5)' }, icon: Shield },
  statute_lookup:            { dot: '#818cf8', badge: { background: 'linear-gradient(to right, rgba(99,102,241,0.15), rgba(59,130,246,0.15))', color: '#4338ca', borderColor: 'rgba(199,210,254,0.5)' }, icon: BookOpen },
  pdf_exported:              { dot: '#f59e0b', badge: { background: 'linear-gradient(to right, rgba(245,158,11,0.15), rgba(249,115,22,0.15))', color: '#b45309', borderColor: 'rgba(253,230,138,0.5)' }, icon: FileText },
  login:                     { dot: '#22c55e', badge: { background: 'linear-gradient(to right, rgba(34,197,94,0.15), rgba(16,185,129,0.15))', color: '#15803d', borderColor: 'rgba(187,247,208,0.5)' }, icon: LogIn },
  logout:                    { dot: '#94a3b8', badge: { background: 'linear-gradient(to right, rgba(100,116,139,0.15), rgba(107,114,128,0.15))', color: '#334155', borderColor: 'rgba(226,232,240,0.5)' }, icon: LogOut },
};

const DEFAULT_STYLE = {
  dot: '#94a3b8',
  badge: { background: 'linear-gradient(to right, rgba(100,116,139,0.15), rgba(107,114,128,0.15))', color: '#475569', borderColor: 'rgba(226,232,240,0.5)' },
  icon: ClipboardList,
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: 'easeOut' },
  }),
};

/* ── Shared inline style fragments ── */
const glassCard = {
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '16px',
  boxShadow: '0 10px 15px -3px rgba(99,102,241,0.05)',
};

const paginationBtnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.625rem 1.25rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '0.75rem',
  color: '#334155',
  boxShadow: '0 10px 15px -3px rgba(99,102,241,0.05)',
  transition: 'all 0.2s',
  cursor: 'pointer',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (actionFilter) params.action = actionFilter;
      const data = await auditApi.getLogs(params);
      setLogs(data.logs || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setLogs([]);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              padding: '0.625rem',
              background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(99,102,241,0.25)',
            }}
          >
            <ClipboardList style={{ width: 24, height: 24, color: '#ffffff' }} />
          </div>
          <div>
            <h1
              className="gradient-text"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: 0,
              }}
            >
              Audit Trail
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.125rem', margin: 0 }}>
              Complete log of all AI interactions and system actions
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Filter Area ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <div
          style={{
            ...glassCard,
            padding: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ position: 'relative' }}>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                paddingLeft: '1rem',
                paddingRight: '2.5rem',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                backgroundColor: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                color: '#334155',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <option value="">All Actions</option>
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                paddingRight: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <svg style={{ width: 16, height: 16, color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', fontSize: '0.875rem', color: '#64748b' }}>
            <Clock style={{ width: 16, height: 16, color: '#818cf8' }} />
            <span>
              Page <span style={{ fontWeight: 600, color: '#334155' }}>{page}</span> of{' '}
              <span style={{ fontWeight: 600, color: '#334155' }}>{totalPages}</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Log Entries ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 0' }}
        >
          <ClipboardList style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>No audit logs found.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence mode="wait">
            {logs.map((log, i) => {
              const actionStyle = ACTION_STYLES[log.action] || DEFAULT_STYLE;
              const ActionIcon = actionStyle.icon;
              return (
                <motion.div
                  key={log._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  whileHover={{ scale: 1.005, transition: { duration: 0.15 } }}
                  style={{
                    ...glassCard,
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Left dot indicator */}
                  <div style={{ flexShrink: 0, paddingTop: '0.25rem' }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '9999px',
                        backgroundColor: actionStyle.dot,
                        boxShadow: '0 0 0 4px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      {/* Action badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          background: actionStyle.badge.background,
                          color: actionStyle.badge.color,
                          border: `1px solid ${actionStyle.badge.borderColor}`,
                          backdropFilter: 'blur(4px)',
                          WebkitBackdropFilter: 'blur(4px)',
                        }}
                      >
                        <ActionIcon style={{ width: 12, height: 12 }} />
                        {ACTION_LABELS[log.action] || log.action}
                      </span>

                      {log.caseId && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: '#2563eb',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            backgroundColor: 'rgba(239,246,255,0.6)',
                            padding: '2px 8px',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(219,234,254,0.5)',
                          }}
                        >
                          {log.caseId.caseNumber || log.caseId}
                        </span>
                      )}

                      {log.durationMs && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                          <Clock style={{ width: 12, height: 12 }} />
                          {(log.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
                      <User style={{ width: 14, height: 14, color: '#94a3b8' }} />
                      <span style={{ fontWeight: 500 }}>{log.userId?.fullName || 'Unknown'}</span>
                      <span style={{ color: '#cbd5e1' }}>&bull;</span>
                      <span style={{ color: '#64748b', textTransform: 'capitalize', fontSize: '0.75rem' }}>{log.userId?.role || ''}</span>
                    </div>

                    {log.details && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          backgroundColor: 'rgba(248,250,252,0.6)',
                          borderRadius: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          border: '1px solid rgba(241,245,249,0.5)',
                          maxWidth: '100%',
                          overflowX: 'auto',
                        }}
                      >
                        {JSON.stringify(log.details)}
                      </div>
                    )}

                    {log.aiModel && (
                      <div style={{ marginTop: '0.375rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <Zap style={{ width: 12, height: 12 }} />
                        Model: {log.aiModel}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              ...paginationBtnBase,
              opacity: page <= 1 ? 0.4 : 1,
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
            Previous
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4338ca' }}>{page}</span>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>/</span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{totalPages}</span>
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              ...paginationBtnBase,
              opacity: page >= totalPages ? 0.4 : 1,
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
