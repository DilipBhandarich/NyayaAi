const sizeConfig = {
  sm: { ring: 20, glow: 24 },
  md: { ring: 32, glow: 40 },
  lg: { ring: 48, glow: 56 },
};

export default function Spinner({ size = 'md' }) {
  const s = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle glow behind the spinner */}
        <div
          className="animate-pulse"
          style={{
            position: 'absolute',
            width: `${s.glow}px`,
            height: `${s.glow}px`,
            borderRadius: '9999px',
            backgroundColor: 'rgba(129,140,248,0.2)',
            filter: 'blur(8px)',
          }}
        />

        {/* Gradient spinning ring */}
        <svg
          className="animate-spin"
          style={{
            width: `${s.ring}px`,
            height: `${s.ring}px`,
          }}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#spinnerGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="90 150"
          />
        </svg>
      </div>
    </div>
  );
}
