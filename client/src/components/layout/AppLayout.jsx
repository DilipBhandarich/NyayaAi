import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function AppLayout() {
  const location = useLocation();

  return (
    <div
      className="noise-overlay"
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #f8fafc, #f9fafb, #f1f5f9)',
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <Header />

        {/* Page Content with Transitions */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {/* Subtle dot pattern background */}
          <div
            className="dot-pattern"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.5,
            }}
          />

          {/* Decorative gradient orbs */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '384px',
              height: '384px',
              backgroundColor: 'rgba(99, 102, 241, 0.03)',
              borderRadius: '9999px',
              filter: 'blur(48px)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '320px',
              height: '320px',
              backgroundColor: 'rgba(6, 182, 212, 0.03)',
              borderRadius: '9999px',
              filter: 'blur(48px)',
              pointerEvents: 'none',
            }}
          />

          {/* Animated page content */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              padding: '24px',
              maxWidth: '1600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
