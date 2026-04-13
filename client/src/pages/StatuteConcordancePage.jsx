import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, ArrowRight, Scale, Filter } from 'lucide-react';
import * as statutesApi from '../api/statutes.api.js';
import Spinner from '../components/ui/Spinner.jsx';

const CODE_TABS = [
  { label: 'All', oldCode: '', newCode: '' },
  { label: 'IPC \u2192 BNS', oldCode: 'IPC', newCode: 'BNS' },
  { label: 'CrPC \u2192 BNSS', oldCode: 'CrPC', newCode: 'BNSS' },
  { label: 'Evidence \u2192 BSA', oldCode: 'Evidence Act', newCode: 'BSA' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function StatuteConcordancePage() {
  const [statutes, setStatutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStatutes();
  }, [activeTab, search]);

  async function fetchStatutes() {
    setLoading(true);
    try {
      const tab = CODE_TABS[activeTab];
      const params = { limit: 200 };
      if (tab.oldCode) params.oldCode = tab.oldCode;
      if (search.trim()) params.q = search.trim();
      const data = await statutesApi.search(params);
      setStatutes(data.statutes || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      setStatutes([]);
    }
    setLoading(false);
  }

  const bailableBadge = (bailable) => {
    if (bailable === true)
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'linear-gradient(to right, #d1fae5, #dcfce7)',
            color: '#047857',
            border: '1px solid #a7f3d0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          Yes
        </span>
      );
    if (bailable === false)
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: 'linear-gradient(to right, #fee2e2, #ffe4e6)',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          No
        </span>
      );
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: '#f1f5f9',
          color: '#64748b',
        }}
      >
        &mdash;
      </span>
    );
  };

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
            <BookOpen style={{ width: 24, height: 24, color: '#ffffff' }} />
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
              IPC/BNS Concordance Table
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.125rem', margin: 0 }}>
              Indian Penal Code &rarr; Bharatiya Nyaya Sanhita &nbsp;|&nbsp; CrPC &rarr; BNSS &nbsp;|&nbsp; Evidence Act &rarr; BSA (effective July 2024)
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ marginBottom: '1.25rem' }}
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              paddingLeft: '1rem',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Search style={{ width: 20, height: 20, color: '#818cf8' }} />
          </div>
          <input
            type="text"
            placeholder="Search by section number, description... (e.g. 302, murder, bail)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '3rem',
              paddingRight: '1rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              backgroundColor: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '1rem',
              fontSize: '0.875rem',
              color: '#1e293b',
              boxShadow: '0 10px 15px -3px rgba(99,102,241,0.05)',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </motion.div>

      {/* ── Code Tabs ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}
      >
        <Filter style={{ width: 16, height: 16, color: '#94a3b8', marginRight: '0.25rem' }} />
        {CODE_TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.875rem',
              borderRadius: '9999px',
              fontWeight: 500,
              transition: 'all 0.2s',
              cursor: 'pointer',
              ...(activeTab === i
                ? {
                    background: 'linear-gradient(to right, #4f46e5, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(99,102,241,0.3)',
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    color: '#475569',
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: 'none',
                  }),
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale style={{ width: 16, height: 16, color: '#818cf8' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>{total} sections</span>
        </div>
      </motion.div>

      {/* ── Table / Content ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <Spinner size="lg" />
        </div>
      ) : statutes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 0' }}
        >
          <BookOpen style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>No statutes found. Run the seed script first.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            backgroundColor: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '1rem',
            boxShadow: '0 20px 25px -5px rgba(99,102,241,0.05)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    background: 'linear-gradient(to right, #f8fafc, rgba(238,242,255,0.3))',
                    borderBottom: '1px solid rgba(199,210,254,0.5)',
                  }}
                >
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Old Code</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Old Section</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600, color: '#818cf8', width: 40 }}></th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Code</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Section</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Penalty</th>
                  <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 600, color: '#334155', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bailable</th>
                </tr>
              </thead>
              <AnimatePresence mode="wait">
                <motion.tbody
                  key={`${activeTab}-${search}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {statutes.map((s, i) => (
                    <motion.tr
                      key={s._id || i}
                      variants={rowVariants}
                      style={{
                        borderBottom: '1px solid rgba(241,245,249,0.6)',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(238,242,255,0.5)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#1e293b' }}>{s.oldCode}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontWeight: 700,
                            color: '#1d4ed8',
                            backgroundColor: 'rgba(239,246,255,0.6)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          S.{s.oldSection}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          color: '#475569',
                          maxWidth: '20rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={s.oldDescription}
                      >
                        {s.oldDescription || s.newDescription || '\u2014'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <ArrowRight style={{ width: 16, height: 16, color: '#818cf8', margin: '0 auto', display: 'block' }} />
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#1e293b' }}>{s.newCode}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontWeight: 700,
                            color: '#047857',
                            backgroundColor: 'rgba(236,253,245,0.6)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          S.{s.newSection}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.75rem 1rem',
                          color: '#475569',
                          fontSize: '0.75rem',
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={s.maxPenalty}
                      >
                        {s.maxPenalty || '\u2014'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        {bailableBadge(s.bailable)}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </AnimatePresence>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
