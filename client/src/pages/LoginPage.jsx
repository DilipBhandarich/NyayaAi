import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { authApi } from '../api/auth.api.js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  BookOpen,
  Gavel,
  Mail,
  Lock,
  User,
  Building2,
  BadgeCheck,
  Loader2,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Floating icon component for the left panel                        */
/* ------------------------------------------------------------------ */
function FloatingIcon({ icon: Icon, size = 28, x, y, delay = 0, duration = 6 }) {
  return (
    <motion.div
      className="absolute text-indigo-400/20"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: [0, 0.6, 0.3, 0.6, 0],
        y: [20, -15, 5, -10, 20],
        rotate: [0, 8, -5, 3, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon size={size} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated particle dots for the left panel                         */
/* ------------------------------------------------------------------ */
function ParticleDots() {
  const dots = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 4 + 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-indigo-400"
          style={{ left: d.x, top: d.y, width: d.size, height: d.size }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable input wrapper with consistent styling                    */
/* ------------------------------------------------------------------ */
function InputWrapper({ children, focused }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px',
        border: focused ? '2px solid #6366f1' : '2px solid #e2e8f0',
        backgroundColor: focused ? '#fafaff' : '#f8fafc',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  LOGIN PAGE                                                        */
/* ================================================================== */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'lawyer',
    courtName: '',
  });

  /* aurora hue rotation */
  const [hue, setHue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHue((h) => (h + 0.3) % 360), 50);
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await authApi.register(form);
        toast.success('Account created! Logging in...');
      }
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'judge', label: 'Judge' },
    { value: 'clerk', label: 'Clerk' },
    { value: 'lawyer', label: 'Lawyer' },
    { value: 'admin', label: 'Admin' },
  ];

  const inputStyle = {
    width: '100%',
    backgroundColor: 'transparent',
    padding: '12px 12px 12px 0',
    fontSize: '14px',
    color: '#1e293b',
    border: 'none',
    outline: 'none',
    lineHeight: '1.5',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '8px',
  };

  const iconBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '14px',
    paddingRight: '4px',
    color: '#94a3b8',
    flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ============================== LEFT PANEL ============================== */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, #020617 0%, #1e1b4b 50%, hsl(${hue + 230}, 60%, 15%) 100%)`,
        }}
      >
        {/* Aurora blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              opacity: 0.2,
              filter: 'blur(120px)',
              background: 'radial-gradient(circle, #818cf8, transparent)',
            }}
            animate={{ x: ['-10%', '20%', '-10%'], y: ['-20%', '10%', '-20%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute"
            style={{
              right: 0,
              bottom: 0,
              width: 400,
              height: 400,
              borderRadius: '50%',
              opacity: 0.15,
              filter: 'blur(100px)',
              background: 'radial-gradient(circle, #6366f1, transparent)',
            }}
            animate={{ x: ['10%', '-15%', '10%'], y: ['15%', '-10%', '15%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <ParticleDots />

        <FloatingIcon icon={Scale} size={48} x="15%" y="20%" delay={0} duration={7} />
        <FloatingIcon icon={BookOpen} size={36} x="70%" y="15%" delay={1.5} duration={6} />
        <FloatingIcon icon={Gavel} size={42} x="60%" y="65%" delay={0.8} duration={8} />
        <FloatingIcon icon={Scale} size={28} x="25%" y="70%" delay={2.2} duration={5} />
        <FloatingIcon icon={BookOpen} size={24} x="80%" y="45%" delay={3} duration={7} />
        <FloatingIcon icon={Gavel} size={30} x="40%" y="85%" delay={1} duration={6} />

        {/* Branding content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 48px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              style={{
                margin: '0 auto 32px',
                display: 'flex',
                height: 80,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              }}
            >
              <Scale size={40} className="text-indigo-300" />
            </div>

            <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
              Nyaya<span style={{ color: '#818cf8' }}>AI</span>
            </h1>
            <motion.p
              style={{
                marginTop: 16,
                fontSize: 18,
                color: 'rgba(199,210,254,0.8)',
                maxWidth: 400,
                margin: '16px auto 0',
                lineHeight: 1.7,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Intelligent legal case analysis powered by advanced AI. Streamline your judicial workflow with precision.
            </motion.p>

            <motion.div
              style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {['Case Analysis', 'Statute Research', 'Prediction Engine', 'Audit Trail'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    borderRadius: 100,
                    border: '1px solid rgba(129,140,248,0.2)',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    padding: '6px 16px',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#a5b4fc',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ============================== RIGHT PANEL ============================== */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 40%, #eef2ff 100%)',
        }}
      >
        {/* Decorative background blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(199,210,254,0.3)',
            filter: 'blur(100px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(191,219,254,0.25)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }}
        />

        <motion.div
          style={{ position: 'relative', width: '100%', maxWidth: 440 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Mobile branding */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 40 }}>
            <div
              style={{
                margin: '0 auto 16px',
                display: 'flex',
                height: 56,
                width: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
                boxShadow: '0 10px 30px rgba(79,70,229,0.3)',
              }}
            >
              <Scale size={28} color="white" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              Nyaya<span style={{ color: '#4f46e5' }}>AI</span>
            </h1>
          </div>

          {/* -------- Card container -------- */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
              padding: '40px 36px',
            }}
          >
            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isRegister ? 'reg' : 'log'}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                style={{ marginBottom: 32 }}
              >
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  {isRegister ? 'Create your account' : 'Welcome back'}
                </h2>
                <p style={{ marginTop: 6, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
                  {isRegister
                    ? 'Fill in your details to get started with NyayaAI'
                    : 'Enter your credentials to access your dashboard'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <AnimatePresence mode="wait">
                  {isRegister && (
                    <motion.div
                      key="register-fields"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 0 }}>
                        {/* Full Name */}
                        <div>
                          <label style={labelStyle}>Full Name</label>
                          <InputWrapper focused={focused === 'fullName'}>
                            <div style={iconBoxStyle}><User size={18} /></div>
                            <input
                              type="text"
                              name="fullName"
                              value={form.fullName}
                              onChange={handleChange}
                              onFocus={() => setFocused('fullName')}
                              onBlur={() => setFocused(null)}
                              required
                              placeholder="John Doe"
                              style={inputStyle}
                            />
                          </InputWrapper>
                        </div>

                        {/* Role */}
                        <div>
                          <label style={labelStyle}>Role</label>
                          <InputWrapper focused={focused === 'role'}>
                            <div style={iconBoxStyle}><BadgeCheck size={18} /></div>
                            <div style={{ position: 'relative', width: '100%' }}>
                              <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                onFocus={() => setFocused('role')}
                                onBlur={() => setFocused(null)}
                                style={{
                                  ...inputStyle,
                                  appearance: 'none',
                                  cursor: 'pointer',
                                  paddingRight: 36,
                                }}
                              >
                                {roleOptions.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                              <div
                                style={{
                                  position: 'absolute',
                                  right: 12,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: '#94a3b8',
                                  pointerEvents: 'none',
                                }}
                              >
                                <ChevronDown size={16} />
                              </div>
                            </div>
                          </InputWrapper>
                        </div>

                        {/* Court name */}
                        <div>
                          <label style={labelStyle}>
                            Court Name <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(optional)</span>
                          </label>
                          <InputWrapper focused={focused === 'courtName'}>
                            <div style={iconBoxStyle}><Building2 size={18} /></div>
                            <input
                              type="text"
                              name="courtName"
                              value={form.courtName}
                              onChange={handleChange}
                              onFocus={() => setFocused('courtName')}
                              onBlur={() => setFocused(null)}
                              placeholder="e.g. Delhi High Court"
                              style={inputStyle}
                            />
                          </InputWrapper>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <InputWrapper focused={focused === 'email'}>
                    <div style={iconBoxStyle}><Mail size={18} /></div>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      required
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                  </InputWrapper>
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <InputWrapper focused={focused === 'password'}>
                    <div style={iconBoxStyle}><Lock size={18} /></div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      required
                      minLength={8}
                      placeholder="Minimum 8 characters"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingRight: 14,
                        color: '#94a3b8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </InputWrapper>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    borderRadius: 12,
                    padding: '14px 0',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'white',
                    background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
                    boxShadow: '0 8px 24px rgba(79,70,229,0.25)',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    marginTop: 8,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                margin: '28px 0',
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)' }} />
            </div>

            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={{
                width: '100%',
                borderRadius: 12,
                border: '2px solid #e2e8f0',
                backgroundColor: 'white',
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 500,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#c7d2fe';
                e.currentTarget.style.color = '#4f46e5';
                e.currentTarget.style.backgroundColor = '#fafaff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {isRegister ? 'Already have an account? Sign in' : "New here? Create an account"}
            </button>
          </div>

          {/* Powered by badge */}
          <motion.div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Sparkles size={13} style={{ color: '#818cf8' }} />
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Powered by Gemini AI</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
