import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { casesApi } from '../api/cases.api.js';
import { documentsApi } from '../api/documents.api.js';
import { evidenceApi } from '../api/evidence.api.js';
import { predictionsApi } from '../api/predictions.api.js';
import * as bailApi from '../api/bail.api.js';
import apiClient from '../api/client.js';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, MessageSquare, Sparkles, Upload, ChevronLeft,
  Shield, Clock, Scale, Brain, Gavel, BookOpen, AlertTriangle,
  CheckCircle2, XCircle, Users, Building2, Calendar, ArrowRight,
  TrendingUp, Target, Eye, Zap, FileSearch, ArrowUpRight
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TABS = ['Overview', 'Documents', 'Evidence', 'Timeline', 'Predictions', 'Bail Assessment', 'Similar Cases'];

const TAB_ICONS = {
  Overview: FileText,
  Documents: Upload,
  Evidence: Shield,
  Timeline: Clock,
  Predictions: Brain,
  'Bail Assessment': Scale,
  'Similar Cases': BookOpen,
};

/* ------------------------------------------------------------------ */
/*  Shared Style Objects                                                */
/* ------------------------------------------------------------------ */

const glassStyle = {
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
};

const glassInnerStyle = {
  backgroundColor: 'rgba(255,255,255,0.4)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '12px',
};

const primaryGradientBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#ffffff',
  borderRadius: '12px',
  background: 'linear-gradient(to right, #4f46e5, #2563eb)',
  boxShadow: '0 10px 15px -3px rgba(99,102,241,0.25)',
  transition: 'all 0.2s',
  border: 'none',
  cursor: 'pointer',
};

const secondaryGlassBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#334155',
  borderRadius: '12px',
  backgroundColor: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.4)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
  transition: 'all 0.2s',
  cursor: 'pointer',
};

const iconBoxStyle = (from, to) => ({
  padding: '8px',
  borderRadius: '8px',
  background: `linear-gradient(to bottom right, ${from}, ${to})`,
});

const sectionHeadingStyle = {
  fontWeight: 600,
  color: '#1e293b',
  fontSize: '18px',
};

const statusColorMap = {
  filed: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid rgba(191,219,254,0.6)' },
  under_review: { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid rgba(253,230,138,0.6)' },
  analysis_pending: { backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid rgba(196,181,253,0.6)' },
  analysis_complete: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' },
  judgment_pending: { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid rgba(253,230,138,0.6)' },
  closed: { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid rgba(226,232,240,0.6)' },
};

const typeColorMap = {
  criminal: { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid rgba(254,202,202,0.6)' },
  civil: { backgroundColor: '#f5f3ff', color: '#7c3aed', border: '1px solid rgba(196,181,253,0.6)' },
  constitutional: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid rgba(191,219,254,0.6)' },
  family: { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid rgba(253,230,138,0.6)' },
  labor: { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid rgba(226,232,240,0.6)' },
  consumer: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' },
  writ_petition: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid rgba(191,219,254,0.6)' },
  pil: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' },
};

const badgeBase = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 600,
  borderRadius: '9999px',
};

const gradientTextStyle = (gradient) => ({
  background: gradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

/* ------------------------------------------------------------------ */
/*  Framer Motion Variants                                             */
/* ------------------------------------------------------------------ */

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function CaseDetailPage() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [exporting, setExporting] = useState(false);
  const fileInput = useRef(null);

  const fetchAll = async () => {
    try {
      const [c, d, e, p] = await Promise.all([
        casesApi.getById(id),
        documentsApi.listByCaseId(id).catch(() => ({ documents: [] })),
        evidenceApi.listByCaseId(id).catch(() => ({ evidence: [] })),
        predictionsApi.listByCaseId(id).catch(() => ({ predictions: [] })),
      ]);
      setCaseData(c.case || c);
      setDocuments(d.documents || []);
      setEvidence(e.evidence || []);
      setPredictions(p.predictions || []);
    } catch {
      toast.error('Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await casesApi.analyze(id);
      toast.success('Analysis complete!');
      await fetchAll();
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const blobData = await apiClient.get(`/cases/${id}/export-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `NyayaAI-${caseData.caseNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF exported');
    } catch {
      toast.error('PDF export failed');
    }
    setExporting(false);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('documentType', 'other');
      try {
        await documentsApi.upload(id, fd);
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    fileInput.current.value = '';
    const d = await documentsApi.listByCaseId(id).catch(() => ({ documents: [] }));
    setDocuments(d.documents || []);
  };

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          <Scale style={{ width: '40px', height: '40px', color: '#6366f1' }} />
        </motion.div>
        <p style={{ color: '#64748b', fontWeight: 500, letterSpacing: '0.025em' }}>Loading case...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
      }}>
        <AlertTriangle style={{ width: '40px', height: '40px', color: '#94a3b8' }} />
        <p style={{ color: '#64748b' }}>Case not found.</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* ============================================================= */}
      {/*  HEADER                                                        */}
      {/* ============================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Breadcrumb */}
        <Link
          to="/cases"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#64748b',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
        >
          <ChevronLeft style={{ width: '16px', height: '16px' }} />
          <span style={{ fontFamily: 'monospace' }}>Cases</span>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontFamily: 'monospace', color: '#334155' }}>{caseData.caseNumber}</span>
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          {/* Title & Badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 style={{
              fontSize: '30px',
              fontWeight: 700,
              lineHeight: 1.25,
              ...gradientTextStyle('linear-gradient(to right, #1e293b, #3730a3, #1e293b)'),
            }}>
              {caseData.title}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              {/* Type Badge */}
              <span style={{
                ...badgeBase,
                ...(typeColorMap[caseData.caseType] || { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid rgba(226,232,240,0.6)' }),
              }}>
                {caseData.caseType?.replace(/_/g, ' ')}
              </span>
              {/* Status Badge */}
              <span style={{
                ...badgeBase,
                ...(statusColorMap[caseData.status] || { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid rgba(226,232,240,0.6)' }),
              }}>
                {caseData.status?.replace(/_/g, ' ')}
              </span>
              {caseData.aiSummary && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  fontWeight: 600,
                  border: '1px solid rgba(167,243,208,0.6)',
                }}>
                  <Sparkles style={{ width: '12px', height: '12px', color: '#10b981' }} />
                  AI Analyzed
                </span>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <button
              onClick={handleExportPdf}
              disabled={exporting}
              style={{
                ...secondaryGlassBtn,
                opacity: exporting ? 0.5 : 1,
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>

            <Link to={`/cases/${id}/chat`} style={{ textDecoration: 'none' }}>
              <button style={secondaryGlassBtn}>
                <MessageSquare style={{ width: '16px', height: '16px' }} />
                AI Chat
              </button>
            </Link>

            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                ...primaryGradientBtn,
                position: 'relative',
                opacity: analyzing ? 0.6 : 1,
              }}
            >
              {analyzing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Sparkles style={{ width: '16px', height: '16px' }} />
                  </motion.div>
                  <span>Analyzing...</span>
                  <motion.span
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  Run AI Analysis
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ============================================================= */}
      {/*  TABS                                                          */}
      {/* ============================================================= */}
      <div style={{ ...glassStyle, padding: '6px', overflowX: 'auto' }}>
        <nav style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab] || FileText;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(isActive
                    ? {
                        background: 'linear-gradient(to right, #4f46e5, #2563eb)',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgba(99,102,241,0.25)',
                      }
                    : {
                        background: 'transparent',
                        color: '#64748b',
                      }
                  ),
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ============================================================= */}
      {/*  TAB CONTENT                                                   */}
      {/* ============================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {activeTab === 'Overview' && <OverviewTab caseData={caseData} />}
          {activeTab === 'Documents' && <DocumentsTab documents={documents} fileInput={fileInput} onUpload={handleUpload} />}
          {activeTab === 'Evidence' && <EvidenceTab evidence={evidence} />}
          {activeTab === 'Timeline' && <TimelineTab timeline={caseData.aiTimeline} />}
          {activeTab === 'Predictions' && <PredictionsTab predictions={predictions} />}
          {activeTab === 'Bail Assessment' && <BailTab caseId={id} caseType={caseData.caseType} />}
          {activeTab === 'Similar Cases' && <SimilarTab caseId={id} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ==================================================================== */
/*  OverviewTab                                                          */
/* ==================================================================== */

function OverviewTab({ caseData }) {
  return (
    <motion.div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
      }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* Case Information */}
      <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={iconBoxStyle('rgba(99,102,241,0.1)', 'rgba(59,130,246,0.1)')}>
            <FileText style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
          </div>
          <h3 style={sectionHeadingStyle}>Case Information</h3>
        </div>
        <dl style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {[
            ['Plaintiff', caseData.plaintiffName, Users],
            ['Defendant', caseData.defendantName, Users],
            ['Plaintiff Lawyer', caseData.plaintiffLawyer, Gavel],
            ['Defendant Lawyer', caseData.defendantLawyer, Gavel],
            ['Court', caseData.courtName, Building2],
            ['Filing Date', caseData.filingDate ? new Date(caseData.filingDate).toLocaleDateString() : null, Calendar],
          ].filter(([, v]) => v).map(([k, v, Icon], idx, arr) => (
            <div key={k} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none',
            }}>
              <dt style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b' }}>
                <Icon style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                {k}
              </dt>
              <dd style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px', margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
        {caseData.description && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.4)' }}>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.625 }}>{caseData.description}</p>
          </div>
        )}
      </motion.div>

      {/* AI Summary */}
      {caseData.aiSummary && (
        <motion.div style={{ ...glassStyle, padding: '24px', position: 'relative', overflow: 'hidden' }} variants={fadeUp}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '128px',
            height: '128px',
            background: 'linear-gradient(to bottom left, rgba(99,102,241,0.05), transparent)',
            borderBottomLeftRadius: '100%',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', position: 'relative' }}>
            <div style={iconBoxStyle('rgba(99,102,241,0.1)', 'rgba(147,51,234,0.1)')}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
            </div>
            <h3 style={sectionHeadingStyle}>AI Summary</h3>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '4px',
              height: '100%',
              position: 'absolute',
              left: 0,
              top: 0,
              borderRadius: '9999px',
              background: 'linear-gradient(to bottom, #6366f1, #3b82f6)',
              opacity: 0.4,
            }} />
            <p style={{
              fontSize: '14px',
              color: '#334155',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.625,
              paddingLeft: '16px',
            }}>
              {caseData.aiSummary}
            </p>
          </div>
        </motion.div>
      )}

      {/* Key Facts */}
      {caseData.aiKeyFacts?.length > 0 && (
        <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={iconBoxStyle('rgba(99,102,241,0.1)', 'rgba(59,130,246,0.1)')}>
              <Target style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
            </div>
            <h3 style={sectionHeadingStyle}>Key Facts</h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {caseData.aiKeyFacts.map((fact, i) => (
              <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                <span style={{
                  flexShrink: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to bottom right, #6366f1, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                }}>
                  {i + 1}
                </span>
                <span style={{ color: '#334155', lineHeight: 1.625, paddingTop: '2px' }}>{fact}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Legal References */}
      {caseData.aiTags?.length > 0 && (
        <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={iconBoxStyle('rgba(59,130,246,0.1)', 'rgba(99,102,241,0.1)')}>
              <BookOpen style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            </div>
            <h3 style={sectionHeadingStyle}>Legal References</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {caseData.aiTags.map((tag, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '9999px',
                  background: 'linear-gradient(to right, #eef2ff, #eff6ff)',
                  color: '#4338ca',
                  border: '1px solid rgba(199,210,254,0.5)',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ==================================================================== */
/*  DocumentsTab                                                         */
/* ==================================================================== */

function DocumentsTab({ documents, fileInput, onUpload }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h3 style={sectionHeadingStyle}>
          Documents
          <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>({documents.length})</span>
        </h3>
        <div>
          <input
            ref={fileInput}
            type="file"
            multiple
            onChange={onUpload}
            style={{ display: 'none' }}
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
          />
          <button
            onClick={() => fileInput.current?.click()}
            style={primaryGradientBtn}
          >
            <Upload style={{ width: '16px', height: '16px' }} />
            Upload Files
          </button>
        </div>
      </div>

      {/* Document Grid */}
      {documents.length === 0 ? (
        <div style={{ ...glassStyle, padding: '48px', textAlign: 'center' }}>
          <Upload style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontWeight: 500 }}>No documents uploaded yet</p>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>Upload files to get started</p>
        </div>
      ) : (
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {documents.map((doc) => (
            <motion.div
              key={doc._id}
              style={{
                ...glassStyle,
                padding: '20px',
                transition: 'all 0.2s',
                cursor: 'default',
              }}
              variants={fadeUp}
              whileHover={{ y: -2, boxShadow: '0 20px 40px rgba(99,102,241,0.1)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    flexShrink: 0,
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom right, rgba(99,102,241,0.1), rgba(59,130,246,0.1))',
                  }}>
                    <FileText style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontWeight: 500,
                      color: '#1e293b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{doc.originalFilename}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {doc.fileType}
                      {doc.fileSize ? ` - ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    ...(doc.isProcessed
                      ? { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' }
                      : { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid rgba(253,230,138,0.6)' }
                    ),
                  }}
                >
                  {doc.isProcessed ? 'Processed' : 'Pending'}
                </span>
              </div>
              {doc.documentType && doc.documentType !== 'other' && (
                <span style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  border: '1px solid rgba(199,210,254,0.5)',
                  fontWeight: 500,
                }}>
                  {doc.documentType.replace(/_/g, ' ')}
                </span>
              )}
              {doc.aiSummary && (
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '12px',
                  lineHeight: 1.625,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{doc.aiSummary}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  EvidenceTab                                                          */
/* ==================================================================== */

function EvidenceTab({ evidence }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={sectionHeadingStyle}>
        Evidence
        <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 400, color: '#94a3b8' }}>({evidence.length})</span>
      </h3>

      {evidence.length === 0 ? (
        <div style={{ ...glassStyle, padding: '48px', textAlign: 'center' }}>
          <Shield style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontWeight: 500 }}>No evidence items</p>
        </div>
      ) : (
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {evidence.map((ev) => (
            <motion.div
              key={ev._id}
              style={{ ...glassStyle, padding: '20px' }}
              variants={fadeUp}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    flexShrink: 0,
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'linear-gradient(to bottom right, rgba(99,102,241,0.1), rgba(59,130,246,0.1))',
                  }}>
                    <Shield style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
                  </div>
                  <h4 style={{ fontWeight: 500, color: '#1e293b', paddingTop: '4px', margin: 0 }}>{ev.title}</h4>
                </div>
                {ev.strength && (
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      ...(ev.strength === 'strong'
                        ? { background: 'linear-gradient(to right, #ecfdf5, #f0fdf4)', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' }
                        : ev.strength === 'medium'
                          ? { background: 'linear-gradient(to right, #fffbeb, #fefce8)', color: '#b45309', border: '1px solid rgba(253,230,138,0.6)' }
                          : { background: 'linear-gradient(to right, #fff1f2, #fef2f2)', color: '#be123c', border: '1px solid rgba(254,205,211,0.6)' }
                      ),
                    }}
                  >
                    {ev.strength}
                  </span>
                )}
              </div>
              {ev.description && (
                <p style={{ fontSize: '14px', color: '#475569', marginTop: '8px', marginLeft: '44px', lineHeight: 1.625 }}>{ev.description}</p>
              )}
              {ev.aiAnalysis && (
                <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px', marginLeft: '44px', fontStyle: 'italic', lineHeight: 1.625 }}>{ev.aiAnalysis}</p>
              )}
              {ev.relevanceScore != null && (
                <div style={{ marginTop: '12px', marginLeft: '44px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                      <motion.div
                        style={{
                          height: '8px',
                          borderRadius: '9999px',
                          background: 'linear-gradient(to right, #6366f1, #3b82f6)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${ev.relevanceScore * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4f46e5', fontVariantNumeric: 'tabular-nums' }}>
                      {(ev.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  TimelineTab                                                          */
/* ==================================================================== */

function TimelineTab({ timeline }) {
  if (!timeline?.length) {
    return (
      <div style={{ ...glassStyle, padding: '48px', textAlign: 'center' }}>
        <Clock style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
        <p style={{ color: '#94a3b8', fontWeight: 500 }}>No timeline data</p>
        <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>Run AI analysis first</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ position: 'relative', paddingLeft: '40px', paddingTop: '8px', paddingBottom: '8px' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* Gradient timeline line */}
      <div style={{
        position: 'absolute',
        left: '18px',
        top: 0,
        bottom: 0,
        width: '2px',
        background: 'linear-gradient(to bottom, #6366f1, #3b82f6, #a5b4fc)',
        borderRadius: '9999px',
      }} />

      {timeline.map((item, i) => (
        <motion.div key={i} style={{ position: 'relative', marginBottom: i < timeline.length - 1 ? '32px' : '0' }} variants={fadeUp}>
          {/* Dot */}
          <div style={{
            position: 'absolute',
            left: '-26px',
            top: '16px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'linear-gradient(to bottom right, #6366f1, #2563eb)',
            border: '3px solid #ffffff',
            boxShadow: '0 4px 6px -1px rgba(99,102,241,0.3)',
          }} />
          {/* Connector */}
          <div style={{
            position: 'absolute',
            left: '-6px',
            top: '20px',
            width: '12px',
            height: '1px',
            backgroundColor: '#c7d2fe',
          }} />
          {/* Card */}
          <div style={{ ...glassStyle, padding: '20px', marginLeft: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Calendar style={{ width: '14px', height: '14px', color: '#6366f1' }} />
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>{item.date}</p>
            </div>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.625, margin: 0 }}>{item.event}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ==================================================================== */
/*  PredictionsTab                                                       */
/* ==================================================================== */

function PredictionsTab({ predictions }) {
  if (!predictions?.length) {
    return (
      <div style={{ ...glassStyle, padding: '48px', textAlign: 'center' }}>
        <Brain style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
        <p style={{ color: '#94a3b8', fontWeight: 500 }}>No predictions yet</p>
        <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>Run AI analysis first</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {predictions.map((pred) => (
        <motion.div
          key={pred._id}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* ----- Predicted Outcome & Confidence ----- */}
          <motion.div style={{ ...glassStyle, padding: '24px', position: 'relative', overflow: 'hidden' }} variants={fadeUp}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '160px',
              height: '160px',
              background: 'linear-gradient(to bottom left, rgba(99,102,241,0.05), transparent)',
              borderBottomLeftRadius: '100%',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={iconBoxStyle('rgba(99,102,241,0.1)', 'rgba(59,130,246,0.1)')}>
                <TrendingUp style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
              </div>
              <h3 style={sectionHeadingStyle}>Predicted Outcome</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px' }}>
              <p style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: 0,
                ...gradientTextStyle('linear-gradient(to right, #4338ca, #2563eb)'),
              }}>
                {pred.predictedOutcome}
              </p>
              {pred.confidenceScore != null && (
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '4px', margin: '0 0 4px 0' }}>Confidence</p>
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px' }}>
                    <svg style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }} viewBox="0 0 72 72">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                      <circle
                        cx="36" cy="36" r="30" fill="none" strokeWidth="5" strokeLinecap="round"
                        stroke="url(#confGrad)"
                        strokeDasharray={`${pred.confidenceScore * 188.5} 188.5`}
                      />
                      <defs>
                        <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={pred.confidenceScore >= 0.7 ? '#10b981' : pred.confidenceScore >= 0.4 ? '#f59e0b' : '#ef4444'} />
                          <stop offset="100%" stopColor={pred.confidenceScore >= 0.7 ? '#059669' : pred.confidenceScore >= 0.4 ? '#d97706' : '#dc2626'} />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span style={{
                      position: 'absolute',
                      fontSize: '20px',
                      fontWeight: 700,
                      color: pred.confidenceScore >= 0.7 ? '#059669' : pred.confidenceScore >= 0.4 ? '#d97706' : '#dc2626',
                    }}>
                      {(pred.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            {pred.reasoning && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.4)' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gavel style={{ width: '14px', height: '14px' }} /> Legal Reasoning
                </h5>
                <p style={{ fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.625, margin: 0 }}>{pred.reasoning}</p>
              </div>
            )}
          </motion.div>

          {/* ----- Judgment Recommendation ----- */}
          {pred.judgmentRecommendation && Object.values(pred.judgmentRecommendation).some(v => v && v !== 'N/A' && v !== 'N/A - Civil matter') && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={iconBoxStyle('rgba(147,51,234,0.1)', 'rgba(99,102,241,0.1)')}>
                  <Gavel style={{ width: '20px', height: '20px', color: '#9333ea' }} />
                </div>
                <h3 style={sectionHeadingStyle}>Judgment Recommendation</h3>
              </div>
              <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: 0 }}>
                {[
                  ['Verdict', pred.judgmentRecommendation.verdict],
                  ['Sentencing Guideline', pred.judgmentRecommendation.sentencingGuideline],
                  ['Fine Range', pred.judgmentRecommendation.fineRange],
                  ['Custodial Sentence', pred.judgmentRecommendation.custodialSentence],
                  ['Probation Eligibility', pred.judgmentRecommendation.probationEligibility],
                  ['Compensation to Victim', pred.judgmentRecommendation.compensationToVictim],
                ].filter(([, v]) => v && v !== 'N/A' && v !== 'N/A - Civil matter').map(([label, value]) => (
                  <div key={label} style={{ ...glassInnerStyle, padding: '16px' }}>
                    <dt style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</dt>
                    <dd style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '6px', margin: '6px 0 0 0' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          )}

          {/* ----- Applicable Sections ----- */}
          {pred.applicableSections?.length > 0 && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={iconBoxStyle('rgba(59,130,246,0.1)', 'rgba(99,102,241,0.1)')}>
                  <BookOpen style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                </div>
                <h3 style={sectionHeadingStyle}>Applicable Legal Sections</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pred.applicableSections.map((sec, i) => (
                  <div key={i} style={{ ...glassInnerStyle, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        ...gradientTextStyle('linear-gradient(to right, #4338ca, #2563eb)'),
                      }}>
                        {sec.section}
                      </span>
                      {sec.maxPenalty && (
                        <span style={{
                          flexShrink: 0,
                          fontSize: '12px',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontWeight: 700,
                          backgroundColor: '#fff1f2',
                          color: '#be123c',
                          border: '1px solid rgba(254,205,211,0.6)',
                        }}>
                          {sec.maxPenalty}
                        </span>
                      )}
                    </div>
                    {sec.description && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', margin: '4px 0 0 0' }}>{sec.description}</p>}
                    {sec.applicability && <p style={{ fontSize: '14px', color: '#334155', marginTop: '6px', lineHeight: 1.625, margin: '6px 0 0 0' }}>{sec.applicability}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ----- Evidence Assessment ----- */}
          {pred.evidenceAssessment && (pred.evidenceAssessment.overallStrength || pred.evidenceAssessment.keyFindings?.length > 0) && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={iconBoxStyle('rgba(59,130,246,0.1)', 'rgba(6,182,212,0.1)')}>
                  <Eye style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                </div>
                <h3 style={sectionHeadingStyle}>Evidence Assessment</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pred.evidenceAssessment.overallStrength && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to right, #eef2ff, #eff6ff)',
                    border: '1px solid rgba(199,210,254,0.5)',
                    alignSelf: 'flex-start',
                  }}>
                    <Shield style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#3730a3', margin: 0 }}>Overall Strength: {pred.evidenceAssessment.overallStrength}</p>
                  </div>
                )}
                {pred.evidenceAssessment.keyFindings?.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#047857', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 style={{ width: '16px', height: '16px' }} /> Key Findings
                    </h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pred.evidenceAssessment.keyFindings.map((f, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                          <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#10b981', flexShrink: 0 }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pred.evidenceAssessment.gaps?.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#be123c', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <XCircle style={{ width: '16px', height: '16px' }} /> Gaps / Weaknesses
                    </h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pred.evidenceAssessment.gaps.map((g, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                          <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#fb7185', flexShrink: 0 }} />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ----- Prosecution vs Defense ----- */}
          {(pred.prosecutionStrengths?.length > 0 || pred.defenseStrengths?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {pred.prosecutionStrengths?.length > 0 && (
                <motion.div
                  style={{
                    ...glassStyle,
                    padding: '24px',
                    borderTop: '2px solid rgba(251,113,133,0.6)',
                  }}
                  variants={fadeUp}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(244,63,94,0.1)' }}>
                      <AlertTriangle style={{ width: '20px', height: '20px', color: '#e11d48' }} />
                    </div>
                    <h3 style={{ fontWeight: 600, color: '#be123c', margin: 0 }}>Prosecution / Plaintiff Strengths</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pred.prosecutionStrengths.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                        <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#fb7185', flexShrink: 0 }} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {pred.defenseStrengths?.length > 0 && (
                <motion.div
                  style={{
                    ...glassStyle,
                    padding: '24px',
                    borderTop: '2px solid rgba(52,211,153,0.6)',
                  }}
                  variants={fadeUp}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.1)' }}>
                      <Shield style={{ width: '20px', height: '20px', color: '#059669' }} />
                    </div>
                    <h3 style={{ fontWeight: 600, color: '#047857', margin: 0 }}>Defense / Defendant Strengths</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pred.defenseStrengths.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                        <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#34d399', flexShrink: 0 }} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* ----- Aggravating & Mitigating Factors ----- */}
          {(pred.aggravatingFactors?.length > 0 || pred.mitigatingFactors?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              {pred.aggravatingFactors?.length > 0 && (
                <motion.div
                  style={{
                    ...glassStyle,
                    padding: '24px',
                    borderTop: '2px solid rgba(248,113,113,0.6)',
                  }}
                  variants={fadeUp}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)' }}>
                      <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                    </div>
                    <h3 style={{ fontWeight: 600, color: '#b91c1c', margin: 0 }}>Aggravating Factors</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pred.aggravatingFactors.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                        <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#f87171', flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
              {pred.mitigatingFactors?.length > 0 && (
                <motion.div
                  style={{
                    ...glassStyle,
                    padding: '24px',
                    borderTop: '2px solid rgba(74,222,128,0.6)',
                  }}
                  variants={fadeUp}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(34,197,94,0.1)' }}>
                      <CheckCircle2 style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                    </div>
                    <h3 style={{ fontWeight: 600, color: '#15803d', margin: 0 }}>Mitigating Factors</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pred.mitigatingFactors.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                        <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#4ade80', flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          )}

          {/* ----- Precedent Analysis ----- */}
          {pred.precedentAnalysis?.length > 0 && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={iconBoxStyle('rgba(99,102,241,0.1)', 'rgba(147,51,234,0.1)')}>
                  <Scale style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                </div>
                <h3 style={sectionHeadingStyle}>Precedent Case Analysis</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pred.precedentAnalysis.map((p, i) => (
                  <div key={i} style={{ ...glassInnerStyle, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{p.caseName}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', margin: '2px 0 0 0' }}>{p.citation}</p>
                      </div>
                      <ArrowUpRight style={{ width: '16px', height: '16px', color: '#cbd5e1', flexShrink: 0 }} />
                    </div>
                    {p.relevance && (
                      <p style={{ fontSize: '14px', color: '#4338ca', marginTop: '8px', margin: '8px 0 0 0' }}>
                        <span style={{ fontWeight: 500 }}>Relevance:</span> {p.relevance}
                      </p>
                    )}
                    {p.howItApplies && (
                      <p style={{ fontSize: '14px', color: '#334155', marginTop: '4px', margin: '4px 0 0 0' }}>
                        <span style={{ fontWeight: 500 }}>Application:</span> {p.howItApplies}
                      </p>
                    )}
                    {p.outcome && (
                      <p style={{ fontSize: '14px', color: '#475569', marginTop: '4px', margin: '4px 0 0 0' }}>
                        <span style={{ fontWeight: 500 }}>Outcome:</span> {p.outcome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ----- Bail Analysis ----- */}
          {pred.bailAnalysis && pred.bailAnalysis.recommendation && pred.bailAnalysis.recommendation !== 'N/A - Civil matter' && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={iconBoxStyle('rgba(245,158,11,0.1)', 'rgba(234,179,8,0.1)')}>
                  <Scale style={{ width: '20px', height: '20px', color: '#d97706' }} />
                </div>
                <h3 style={sectionHeadingStyle}>Bail Analysis</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(to right, #fffbeb, #fefce8)',
                  border: '1px solid rgba(253,230,138,0.5)',
                  alignSelf: 'flex-start',
                }}>
                  <Gavel style={{ width: '16px', height: '16px', color: '#d97706' }} />
                  <p style={{ fontWeight: 600, color: '#92400e', margin: 0 }}>Recommendation: {pred.bailAnalysis.recommendation}</p>
                </div>
                {pred.bailAnalysis.reasoning && (
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.625, margin: 0 }}>{pred.bailAnalysis.reasoning}</p>
                )}
                {pred.bailAnalysis.conditions?.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>Suggested Conditions</h5>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pred.bailAnalysis.conditions.map((c, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#334155' }}>
                          <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#f59e0b', flexShrink: 0 }} />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ----- Alternative Outcomes ----- */}
          {pred.alternativeOutcomes?.length > 0 && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={iconBoxStyle('rgba(100,116,139,0.1)', 'rgba(99,102,241,0.1)')}>
                  <Zap style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                </div>
                <h3 style={sectionHeadingStyle}>Alternative Possible Outcomes</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pred.alternativeOutcomes.map((alt, i) => (
                  <div key={i} style={{ ...glassInnerStyle, padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Probability ring */}
                    <div style={{ flexShrink: 0, position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: '56px', height: '56px', transform: 'rotate(-90deg)' }} viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="22" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                        <circle
                          cx="28" cy="28" r="22" fill="none" strokeWidth="4" strokeLinecap="round"
                          stroke="#6366f1"
                          strokeDasharray={`${(alt.probability != null ? alt.probability : 0) * 138.2} 138.2`}
                        />
                      </svg>
                      <span style={{ position: 'absolute', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        {alt.probability != null ? `${(alt.probability * 100).toFixed(0)}%` : '?'}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>{alt.outcome}</p>
                      {alt.reasoning && <p style={{ fontSize: '14px', color: '#475569', marginTop: '4px', lineHeight: 1.625, margin: '4px 0 0 0' }}>{alt.reasoning}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ----- Relevant Laws ----- */}
          {pred.relevantLaws?.length > 0 && (
            <motion.div style={{ ...glassStyle, padding: '24px' }} variants={fadeUp}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={iconBoxStyle('rgba(99,102,241,0.1)', 'rgba(59,130,246,0.1)')}>
                  <BookOpen style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                </div>
                <h3 style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>All Relevant Laws</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {pred.relevantLaws.map((law, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      borderRadius: '9999px',
                      background: 'linear-gradient(to right, #eef2ff, #eff6ff)',
                      color: '#4338ca',
                      border: '1px solid rgba(199,210,254,0.5)',
                      boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                    }}
                  >
                    {law}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* ----- Risk Factors ----- */}
          {pred.riskFactors?.length > 0 && (
            <motion.div
              style={{
                backgroundColor: 'rgba(255,251,235,0.6)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(253,230,138,0.4)',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(245,158,11,0.05)',
                padding: '24px',
              }}
              variants={fadeUp}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.1)' }}>
                  <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706' }} />
                </div>
                <h3 style={{ fontWeight: 600, color: '#92400e', margin: 0 }}>Risk Factors & Concerns</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pred.riskFactors.map((rf, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#78350f' }}>
                    <AlertTriangle style={{ width: '14px', height: '14px', marginTop: '2px', color: '#f59e0b', flexShrink: 0 }} />
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* ----- Disclaimer ----- */}
          {pred.disclaimer && (
            <motion.div
              style={{
                backgroundColor: 'rgba(255,251,235,0.5)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(253,230,138,0.4)',
                borderRadius: '16px',
                padding: '20px',
              }}
              variants={fadeUp}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: '#92400e', fontWeight: 500, lineHeight: 1.625, margin: 0 }}>{pred.disclaimer}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ==================================================================== */
/*  BailTab                                                              */
/* ==================================================================== */

function BailTab({ caseId, caseType }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchAssessments(); }, [caseId]);

  async function fetchAssessments() {
    try {
      const data = await bailApi.list(caseId);
      setAssessments(data.assessments || []);
    } catch { setAssessments([]); }
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      await bailApi.generate(caseId);
      toast.success('Bail assessment generated');
      await fetchAssessments();
    } catch { toast.error('Bail assessment failed'); }
    setGenerating(false);
  }

  const riskBadge = (level) => {
    const colors = {
      low: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' },
      medium: { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid rgba(253,230,138,0.6)' },
      high: { backgroundColor: '#fff1f2', color: '#be123c', border: '1px solid rgba(254,205,211,0.6)' },
    };
    const defaultColor = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid rgba(226,232,240,0.6)' };
    return (
      <span style={{
        fontSize: '12px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontWeight: 700,
        ...(colors[level] || defaultColor),
      }}>
        {level || 'N/A'}
      </span>
    );
  };

  const recBadge = (rec) => {
    const colors = {
      grant: 'linear-gradient(to right, #10b981, #16a34a)',
      deny: 'linear-gradient(to right, #f43f5e, #dc2626)',
      conditional: 'linear-gradient(to right, #f59e0b, #ca8a04)',
    };
    return (
      <span style={{
        fontSize: '14px',
        padding: '6px 16px',
        borderRadius: '9999px',
        fontWeight: 700,
        color: '#ffffff',
        background: colors[rec] || 'linear-gradient(to right, #94a3b8, #64748b)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}>
        {(rec || 'N/A').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        gap: '16px',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          <Scale style={{ width: '32px', height: '32px', color: '#6366f1' }} />
        </motion.div>
        <p style={{ color: '#94a3b8', fontWeight: 500 }}>Loading assessments...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          {caseType !== 'criminal' && 'Bail assessment is primarily applicable to criminal cases.'}
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            ...primaryGradientBtn,
            position: 'relative',
            opacity: generating ? 0.6 : 1,
          }}
        >
          {generating ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Scale style={{ width: '16px', height: '16px' }} />
              </motion.div>
              Generating...
            </>
          ) : (
            <>
              <Scale style={{ width: '16px', height: '16px' }} />
              Generate Bail Assessment
            </>
          )}
        </button>
      </div>

      {/* Assessments */}
      {assessments.length === 0 ? (
        <div style={{ ...glassStyle, padding: '48px', textAlign: 'center' }}>
          <Scale style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontWeight: 500 }}>No bail assessments yet</p>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>Click "Generate Bail Assessment" to create one</p>
        </div>
      ) : (
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {assessments.map((a) => (
            <motion.div key={a._id} style={{ ...glassStyle, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }} variants={fadeUp}>

              {/* Recommendation Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Scale style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                    Bail Recommendation
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginLeft: '28px', margin: '4px 0 0 28px' }}>
                    Generated {new Date(a.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                {recBadge(a.recommendation)}
              </div>

              {/* Risk Assessment Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  ['Flight Risk', a.flightRisk],
                  ['Evidence Tampering', a.evidenceTamperingRisk],
                  ['Witness Influence', a.witnessInfluenceRisk],
                  ['Public Safety', a.publicSafetyRisk],
                ].map(([label, level]) => (
                  <div key={label} style={{ ...glassInnerStyle, padding: '14px' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '8px', margin: '0 0 8px 0' }}>{label}</p>
                    {riskBadge(level)}
                  </div>
                ))}
              </div>

              {/* Offense & Custody Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '14px' }}>
                {[
                  ['Offense Category', a.offenseCategory],
                  ['Max Sentence', a.maxSentence],
                  ['Criminal History', a.criminalHistory],
                  ['Investigation', a.investigationStatus],
                  ...(a.suretyAmount ? [['Surety Amount', a.suretyAmount]] : []),
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>{label}:</span>
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{value || 'N/A'}</span>
                  </div>
                ))}
              </div>

              {/* Reasoning */}
              {a.reasoning && (
                <div>
                  <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                    <Gavel style={{ width: '16px', height: '16px', color: '#6366f1' }} /> Reasoning
                  </h4>
                  <p style={{ fontSize: '14px', color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.625, margin: 0 }}>{a.reasoning}</p>
                </div>
              )}

              {/* Arnesh Kumar Checklist */}
              {a.arneshKumarChecklist?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
                    <FileSearch style={{ width: '16px', height: '16px', color: '#6366f1' }} />
                    Arnesh Kumar v. State of Bihar Checklist
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {a.arneshKumarChecklist.map((item, i) => (
                      <div key={i} style={{ ...glassInnerStyle, padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {item.satisfied ? (
                          <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        ) : (
                          <XCircle style={{ width: '20px', height: '20px', color: '#f43f5e', flexShrink: 0, marginTop: '2px' }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: '14px', color: '#334155' }}>{item.item}</span>
                          {item.remarks && (
                            <span style={{ fontSize: '14px', color: '#94a3b8', marginLeft: '4px' }}>-- {item.remarks}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {a.recommendedConditions?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0' }}>
                    <Shield style={{ width: '16px', height: '16px', color: '#6366f1' }} /> Recommended Conditions
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {a.recommendedConditions.map((c, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#475569' }}>
                        <ArrowRight style={{ width: '14px', height: '14px', marginTop: '2px', color: '#818cf8', flexShrink: 0 }} />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Precedents */}
              {a.relevantPrecedents?.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
                    <BookOpen style={{ width: '16px', height: '16px', color: '#6366f1' }} /> Relevant Precedents
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {a.relevantPrecedents.map((p, i) => (
                      <div key={i} style={{ borderLeft: '2px solid #a5b4fc', paddingLeft: '16px' }}>
                        <p style={{ fontWeight: 500, color: '#3730a3', fontSize: '14px', margin: 0 }}>
                          {p.caseName} {p.citation && `(${p.citation})`}
                        </p>
                        <p style={{ fontSize: '14px', color: '#475569', marginTop: '2px', margin: '2px 0 0 0' }}>{p.relevance}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', margin: '2px 0 0 0' }}>Outcome: {p.outcome}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {a.disclaimer && (
                <div style={{
                  backgroundColor: 'rgba(255,251,235,0.6)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(253,230,138,0.4)',
                  borderRadius: '12px',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '12px', color: '#92400e', fontWeight: 500, lineHeight: 1.625, margin: 0 }}>{a.disclaimer}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ==================================================================== */
/*  SimilarTab                                                           */
/* ==================================================================== */

function SimilarTab({ caseId }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/cases/${caseId}/similar`)
      .then((data) => setSimilar(data.similarCases || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        gap: '16px',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          <BookOpen style={{ width: '32px', height: '32px', color: '#6366f1' }} />
        </motion.div>
        <p style={{ color: '#94a3b8', fontWeight: 500 }}>Finding similar cases...</p>
      </div>
    );
  }

  if (!similar.length) {
    return (
      <div style={{ ...glassStyle, padding: '48px', textAlign: 'center' }}>
        <BookOpen style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
        <p style={{ color: '#94a3b8', fontWeight: 500 }}>No similar cases found</p>
        <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>Run AI analysis first</p>
      </div>
    );
  }

  return (
    <motion.div
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {similar.map((sc, i) => (
        <motion.div
          key={sc._id || i}
          style={{
            ...glassStyle,
            padding: '20px',
            transition: 'all 0.2s',
          }}
          variants={fadeUp}
          whileHover={{ y: -2, boxShadow: '0 20px 40px rgba(99,102,241,0.1)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: '#1e293b', margin: 0 }}>{sc.title}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', margin: '2px 0 0 0' }}>
                {sc.caseReference}
                {sc.court && ` - ${sc.court}`}
                {sc.year && ` (${sc.year})`}
              </p>
            </div>
            {sc.score != null && (
              <span style={{
                flexShrink: 0,
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontWeight: 700,
                background: 'linear-gradient(to right, #ecfdf5, #f0fdf4)',
                color: '#047857',
                border: '1px solid rgba(167,243,208,0.6)',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
              }}>
                {(sc.score * 100).toFixed(0)}% match
              </span>
            )}
          </div>
          {sc.summary && (
            <p style={{ fontSize: '14px', color: '#475569', marginTop: '12px', lineHeight: 1.625, margin: '12px 0 0 0' }}>{sc.summary}</p>
          )}
          {sc.outcome && (
            <p style={{ fontSize: '14px', marginTop: '8px', margin: '8px 0 0 0' }}>
              <span style={{ fontWeight: 500, color: '#334155' }}>Outcome:</span>{' '}
              <span style={{ color: '#475569' }}>{sc.outcome}</span>
            </p>
          )}
          {sc.keyLaws?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {sc.keyLaws.map((law, j) => (
                <span
                  key={j}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: '9999px',
                    background: 'linear-gradient(to right, #eef2ff, #eff6ff)',
                    color: '#4338ca',
                    border: '1px solid rgba(199,210,254,0.5)',
                  }}
                >
                  {law}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
