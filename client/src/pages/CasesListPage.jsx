import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesApi } from '../api/cases.api.js';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Scale,
  FolderOpen,
  Calendar,
  Users,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Colour / style maps  (hex values – Tailwind v4 compatible)        */
/* ------------------------------------------------------------------ */

const statusStyles = {
  filed:             { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  under_review:      { bg: '#fffbeb', text: '#a16207', border: '#fde68a', dot: '#eab308' },
  analysis_pending:  { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', dot: '#a855f7' },
  analysis_complete: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
  judgment_pending:  { bg: '#fffbeb', text: '#a16207', border: '#fde68a', dot: '#eab308' },
  closed:            { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', dot: '#9ca3af' },
};

const typeStyles = {
  criminal:       { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', accent: '#ef4444' },
  civil:          { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', accent: '#a855f7' },
  constitutional: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', accent: '#3b82f6' },
  family:         { bg: '#fffbeb', text: '#a16207', border: '#fde68a', accent: '#eab308' },
  labor:          { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', accent: '#9ca3af' },
  consumer:       { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', accent: '#22c55e' },
  tax:            { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', accent: '#9ca3af' },
  land_revenue:   { bg: '#fffbeb', text: '#a16207', border: '#fde68a', accent: '#eab308' },
  motor_accident: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', accent: '#ef4444' },
  arbitration:    { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', accent: '#a855f7' },
  writ_petition:  { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', accent: '#3b82f6' },
  pil:            { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', accent: '#22c55e' },
};

const defaultTypeStyle   = { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', accent: '#cbd5e1' };
const defaultStatusStyle = { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', dot: '#9ca3af' };

/* ------------------------------------------------------------------ */
/*  Reusable inline-style objects                                     */
/* ------------------------------------------------------------------ */

const glassCard = {
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
};

const glassInputStyle = {
  width: '100%',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  backgroundColor: 'rgba(248,250,252,0.6)',
  padding: '10px 12px',
  fontSize: '14px',
  color: '#334155',
  outline: 'none',
  transition: 'all 0.2s',
  boxSizing: 'border-box',
};

const selectArrowSvg =
  "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2.5 4.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E\")";

const glassSelectStyle = {
  ...glassInputStyle,
  width: 'auto',
  minWidth: '160px',
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: selectArrowSvg,
  backgroundSize: '12px',
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  paddingRight: '32px',
};

const gradientBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#ffffff',
  border: 'none',
  boxShadow: '0 10px 15px -3px rgba(79,70,229,0.3)',
  transition: 'all 0.2s',
  cursor: 'pointer',
};

const paginationBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.4)',
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#475569',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  transition: 'all 0.2s',
  cursor: 'pointer',
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#64748b',
};

const badgeStyle = (colors) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 600,
  lineHeight: '20px',
  backgroundColor: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  whiteSpace: 'nowrap',
});

/* ------------------------------------------------------------------ */
/*  Focus helpers (inline styles cannot handle :focus pseudo-class)    */
/* ------------------------------------------------------------------ */

const handleInputFocus = (e) => {
  e.target.style.borderColor = '#818cf8';
  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
};

const handleInputBlur = (e) => {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'none';
};

/* ------------------------------------------------------------------ */
/*  Hover helpers for buttons                                         */
/* ------------------------------------------------------------------ */

const handleGradientBtnEnter = (e) => {
  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(79,70,229,0.4)';
  e.currentTarget.style.filter = 'brightness(1.1)';
};

const handleGradientBtnLeave = (e) => {
  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(79,70,229,0.3)';
  e.currentTarget.style.filter = 'brightness(1)';
};

const handlePagBtnEnter = (e) => {
  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.8)';
  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
};

const handlePagBtnLeave = (e) => {
  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)';
  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
};

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

/* ------------------------------------------------------------------ */
/*  Pretty label helpers                                              */
/* ------------------------------------------------------------------ */

const prettifyStatus = (s) =>
  s ? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

const prettifyType = (t) =>
  t ? t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

/* ------------------------------------------------------------------ */
/*  Main page component                                               */
/* ------------------------------------------------------------------ */

export default function CasesListPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    caseType: '',
    search: '',
    page: 1,
    limit: 12,
  });
  const [total, setTotal] = useState(0);

  /* ---- data fetching ---- */

  const fetchCases = () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.caseType) params.caseType = filters.caseType;
    if (filters.search) params.search = filters.search;
    params.page = filters.page;
    params.limit = filters.limit;

    casesApi
      .list(params)
      .then((data) => {
        setCases(data.cases || []);
        setTotal(data.total || 0);
      })
      .catch(() => toast.error('Failed to load cases'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCases();
  }, [filters.status, filters.caseType, filters.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((p) => ({ ...p, page: 1 }));
    fetchCases();
  };

  const totalPages = Math.ceil(total / filters.limit);

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ========== Page Header ========== */}
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                height: '40px',
                width: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'linear-gradient(to bottom right, #4f46e5, #2563eb)',
                boxShadow: '0 10px 15px -3px rgba(79,70,229,0.3)',
              }}
            >
              <FileText style={{ height: '20px', width: '20px', color: '#ffffff' }} />
            </div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#1e293b',
                margin: 0,
              }}
            >
              Cases
            </h1>
          </div>
          <p style={{ paddingLeft: '52px', fontSize: '14px', color: '#64748b', margin: 0 }}>
            {total} case{total !== 1 ? 's' : ''} total
          </p>
        </div>
      </motion.div>

      {/* ========== Filter Bar ========== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{ ...glassCard, padding: '16px' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            style={{ position: 'relative', flex: '1 1 0%', minWidth: '220px' }}
          >
            <Search
              style={{
                pointerEvents: 'none',
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '16px',
                width: '16px',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search cases..."
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={{ ...glassInputStyle, paddingLeft: '36px' }}
            />
          </form>

          {/* Status dropdown */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))
            }
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={glassSelectStyle}
          >
            <option value="">All Statuses</option>
            <option value="filed">Filed</option>
            <option value="under_review">Under Review</option>
            <option value="analysis_pending">Analysis Pending</option>
            <option value="analysis_complete">Analysis Complete</option>
            <option value="judgment_pending">Judgment Pending</option>
            <option value="closed">Closed</option>
          </select>

          {/* Case type dropdown */}
          <select
            value={filters.caseType}
            onChange={(e) =>
              setFilters((p) => ({ ...p, caseType: e.target.value, page: 1 }))
            }
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={glassSelectStyle}
          >
            <option value="">All Types</option>
            <option value="criminal">Criminal</option>
            <option value="civil">Civil</option>
            <option value="constitutional">Constitutional</option>
            <option value="family">Family</option>
            <option value="labor">Labor</option>
            <option value="consumer">Consumer</option>
            <option value="tax">Tax</option>
            <option value="land_revenue">Land Revenue</option>
            <option value="motor_accident">Motor Accident</option>
            <option value="arbitration">Arbitration</option>
            <option value="writ_petition">Writ Petition</option>
            <option value="pil">PIL</option>
          </select>

          {/* New Case button */}
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            onMouseEnter={handleGradientBtnEnter}
            onMouseLeave={handleGradientBtnLeave}
            style={{ ...gradientBtnStyle, marginLeft: 'auto' }}
          >
            <Plus style={{ height: '16px', width: '16px' }} />
            New Case
          </button>
        </div>
      </motion.div>

      {/* ========== Content ========== */}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* ---------- Empty state ---------- */}
          {cases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                ...glassCard,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px',
              }}
            >
              <div
                style={{
                  marginBottom: '20px',
                  display: 'flex',
                  height: '80px',
                  width: '80px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  background: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)',
                }}
              >
                <FolderOpen style={{ height: '40px', width: '40px', color: '#94a3b8' }} />
              </div>
              <h3
                style={{
                  marginBottom: '4px',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#334155',
                  marginTop: 0,
                }}
              >
                No cases found
              </h3>
              <p
                style={{
                  marginBottom: '24px',
                  maxWidth: '384px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                {filters.search || filters.status || filters.caseType
                  ? 'Try adjusting your filters or search query.'
                  : 'Get started by creating your first case.'}
              </p>
              {!filters.search && !filters.status && !filters.caseType && (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  onMouseEnter={handleGradientBtnEnter}
                  onMouseLeave={handleGradientBtnLeave}
                  style={gradientBtnStyle}
                >
                  <Plus style={{ height: '16px', width: '16px' }} />
                  Create your first case
                </button>
              )}
            </motion.div>
          ) : (
            /* ---------- Cases grid ---------- */
            <AnimatePresence mode="wait">
              <motion.div
                key={`${filters.page}-${filters.status}-${filters.caseType}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '20px',
                }}
              >
                {cases.map((c) => {
                  const ts = typeStyles[c.caseType] || defaultTypeStyle;
                  const ss = statusStyles[c.status] || defaultStatusStyle;

                  return (
                    <motion.div
                      key={c._id}
                      variants={cardVariants}
                      whileHover={{ scale: 1.02, y: -4 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Link
                        to={`/cases/${c._id}`}
                        style={{ display: 'block', height: '100%', textDecoration: 'none', color: 'inherit' }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.4)',
                            borderLeft: `4px solid ${ts.accent}`,
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            padding: '20px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
                            transition: 'box-shadow 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Top row: case number + type badge */}
                          <div
                            style={{
                              marginBottom: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: '12px',
                                letterSpacing: '0.05em',
                                color: '#94a3b8',
                              }}
                            >
                              {c.caseNumber}
                            </span>
                            <span style={badgeStyle(ts)}>
                              {prettifyType(c.caseType)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              lineHeight: 1.4,
                              color: '#1e293b',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              margin: '0 0 12px 0',
                            }}
                          >
                            {c.title}
                          </h3>

                          {/* Parties */}
                          {(c.plaintiffName || c.defendantName) && (
                            <div
                              style={{
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: '#64748b',
                              }}
                            >
                              <Users
                                style={{
                                  height: '14px',
                                  width: '14px',
                                  flexShrink: 0,
                                  color: '#94a3b8',
                                }}
                              />
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {c.plaintiffName || '?'}{' '}
                                <span style={{ fontWeight: 500, color: '#94a3b8' }}>vs</span>{' '}
                                {c.defendantName || '?'}
                              </span>
                            </div>
                          )}

                          {/* Bottom row: status + date */}
                          <div
                            style={{
                              marginTop: 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '8px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {/* Status dot */}
                              <span
                                style={{
                                  display: 'inline-block',
                                  height: '8px',
                                  width: '8px',
                                  borderRadius: '9999px',
                                  backgroundColor: ss.dot,
                                }}
                              />
                              {/* Status badge */}
                              <span style={badgeStyle(ss)}>
                                {prettifyStatus(c.status)}
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#94a3b8',
                              }}
                            >
                              <Calendar style={{ height: '14px', width: '14px' }} />
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : ''}
                            </div>
                          </div>

                          {/* Hover shimmer overlay (shown via framer-motion parent whileHover) */}
                          <div
                            style={{
                              pointerEvents: 'none',
                              position: 'absolute',
                              inset: 0,
                              borderRadius: '16px',
                              background: 'linear-gradient(to bottom right, rgba(238,242,255,0.35), transparent, transparent)',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                            }}
                          />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ---------- Pagination ---------- */}
          {total > filters.limit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                paddingTop: '8px',
              }}
            >
              <button
                disabled={filters.page <= 1}
                onClick={() =>
                  setFilters((p) => ({ ...p, page: p.page - 1 }))
                }
                onMouseEnter={handlePagBtnEnter}
                onMouseLeave={handlePagBtnLeave}
                style={{
                  ...paginationBtnStyle,
                  opacity: filters.page <= 1 ? 0.4 : 1,
                  pointerEvents: filters.page <= 1 ? 'none' : 'auto',
                }}
              >
                <ChevronLeft style={{ height: '16px', width: '16px' }} />
                Prev
              </button>

              <span
                style={{
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#475569',
                }}
              >
                Page{' '}
                <span style={{ fontWeight: 700, color: '#4f46e5' }}>
                  {filters.page}
                </span>{' '}
                of{' '}
                <span style={{ fontWeight: 700, color: '#334155' }}>
                  {totalPages}
                </span>
              </span>

              <button
                disabled={filters.page >= totalPages}
                onClick={() =>
                  setFilters((p) => ({ ...p, page: p.page + 1 }))
                }
                onMouseEnter={handlePagBtnEnter}
                onMouseLeave={handlePagBtnLeave}
                style={{
                  ...paginationBtnStyle,
                  opacity: filters.page >= totalPages ? 0.4 : 1,
                  pointerEvents: filters.page >= totalPages ? 'none' : 'auto',
                }}
              >
                Next
                <ChevronRight style={{ height: '16px', width: '16px' }} />
              </button>
            </motion.div>
          )}
        </>
      )}

      {/* ========== Create Case Modal ========== */}
      <CreateCaseModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);
          fetchCases();
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CreateCaseModal                                                   */
/* ------------------------------------------------------------------ */

function CreateCaseModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    caseType: 'criminal',
    description: '',
    plaintiffName: '',
    defendantName: '',
    courtName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await casesApi.create(form);
      toast.success('Case created');
      onCreated();
      setForm({
        title: '',
        caseType: 'criminal',
        description: '',
        plaintiffName: '',
        defendantName: '',
        courtName: '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Case">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Title */}
        <div>
          <label style={labelStyle}>
            Title <span style={{ color: '#f87171' }}>*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="Enter case title"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={glassInputStyle}
          />
        </div>

        {/* Case type */}
        <div>
          <label style={labelStyle}>
            Type <span style={{ color: '#f87171' }}>*</span>
          </label>
          <select
            name="caseType"
            value={form.caseType}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={{ ...glassSelectStyle, width: '100%' }}
          >
            <option value="criminal">Criminal</option>
            <option value="civil">Civil</option>
            <option value="constitutional">Constitutional</option>
            <option value="family">Family</option>
            <option value="labor">Labor</option>
            <option value="consumer">Consumer</option>
            <option value="tax">Tax</option>
            <option value="land_revenue">Land Revenue</option>
            <option value="motor_accident">Motor Accident</option>
            <option value="arbitration">Arbitration</option>
            <option value="writ_petition">Writ Petition</option>
            <option value="pil">PIL</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief summary of the case"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={{ ...glassInputStyle, resize: 'none' }}
          />
        </div>

        {/* Plaintiff / Defendant */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Plaintiff</label>
            <input
              name="plaintiffName"
              value={form.plaintiffName}
              onChange={handleChange}
              placeholder="Plaintiff name"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={glassInputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Defendant</label>
            <input
              name="defendantName"
              value={form.defendantName}
              onChange={handleChange}
              placeholder="Defendant name"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={glassInputStyle}
            />
          </div>
        </div>

        {/* Court name */}
        <div>
          <label style={labelStyle}>Court Name</label>
          <input
            name="courtName"
            value={form.courtName}
            onChange={handleChange}
            placeholder="e.g. Supreme Court of India"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={glassInputStyle}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              backgroundColor: 'rgba(255,255,255,0.7)',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            onMouseEnter={!submitting ? handleGradientBtnEnter : undefined}
            onMouseLeave={!submitting ? handleGradientBtnLeave : undefined}
            style={{
              ...gradientBtnStyle,
              opacity: submitting ? 0.5 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin"
                  style={{ height: '16px', width: '16px' }}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <Scale style={{ height: '16px', width: '16px' }} />
                Create Case
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
