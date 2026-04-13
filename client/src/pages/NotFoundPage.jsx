import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Scale, ShieldAlert, Gavel } from 'lucide-react';

/* ── Floating particle background dots ── */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 3,
}));

/* ── Floating decorative icon configs ── */
const floatingIcons = [
  { Icon: Scale,       x: -120, y: -90,  delay: 0,   rotate: -12 },
  { Icon: ShieldAlert, x: 130,  y: -70,  delay: 0.5, rotate: 15  },
  { Icon: Gavel,       x: -100, y: 100,  delay: 1.0, rotate: -8  },
];

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #f8fafc, rgba(238,242,255,0.3), rgba(239,246,255,0.4))',
      }}
    >
      {/* ── Particle / dot background ── */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            borderRadius: '9999px',
            backgroundColor: 'rgba(129,140,248,0.2)',
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ── Ambient gradient blobs ── */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '-8rem',
          width: '24rem',
          height: '24rem',
          backgroundColor: 'rgba(199,210,254,0.3)',
          borderRadius: '9999px',
          filter: 'blur(64px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '-8rem',
          width: '24rem',
          height: '24rem',
          backgroundColor: 'rgba(191,219,254,0.3)',
          borderRadius: '9999px',
          filter: 'blur(64px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Main content ── */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 1.5rem' }}>
        {/* Floating decorative icons */}
        {floatingIcons.map(({ Icon, x, y, delay, rotate }, i) => (
          <motion.div
            key={i}
            style={{ position: 'absolute', left: '50%', top: '50%' }}
            initial={{ opacity: 0, x, y, rotate: 0 }}
            animate={{
              opacity: [0, 0.15, 0.15, 0],
              x: [x, x + 10, x - 10, x],
              y: [y, y - 15, y + 10, y],
              rotate: [0, rotate, -rotate, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          >
            <Icon style={{ width: 64, height: 64, color: '#818cf8' }} />
          </motion.div>
        ))}

        {/* 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          className="gradient-text"
          style={{
            fontSize: '10rem',
            fontWeight: 800,
            lineHeight: 1,
            userSelect: 'none',
            margin: 0,
          }}
        >
          404
        </motion.h1>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2
            style={{
              fontSize: '1.875rem',
              fontWeight: 700,
              color: '#1e293b',
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Page not found
          </h2>
          <p
            style={{
              color: '#64748b',
              maxWidth: '28rem',
              margin: '0 auto',
              lineHeight: 1.625,
            }}
          >
            The page you are looking for does not exist, has been moved, or is temporarily unavailable.
          </p>
        </motion.div>

        {/* Back to Dashboard button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginTop: '2.5rem' }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.875rem 2rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
              background: 'linear-gradient(to right, #4f46e5, #2563eb)',
              borderRadius: '1rem',
              boxShadow: '0 20px 25px -5px rgba(99,102,241,0.3)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Dashboard
            <Home style={{ width: 16, height: 16 }} />
          </Link>
        </motion.div>

        {/* Decorative glass card beneath button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ marginTop: '2.5rem', maxWidth: '20rem', margin: '2.5rem auto 0' }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '1rem',
              padding: '1rem 1.5rem',
              boxShadow: '0 10px 15px -3px rgba(99,102,241,0.05)',
            }}
          >
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              NyayaAI &mdash; Legal Intelligence Platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
