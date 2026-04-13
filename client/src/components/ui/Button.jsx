import { useState } from 'react';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(79,70,229,0.25)',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#334155',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #e11d48)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(239,68,68,0.25)',
    border: 'none',
  },
  success: {
    background: 'linear-gradient(135deg, #10b981, #16a34a)',
    color: 'white',
    boxShadow: '0 10px 25px rgba(16,185,129,0.25)',
    border: 'none',
  },
  outline: {
    border: '1px solid #e2e8f0',
    color: '#334155',
    backgroundColor: 'transparent',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
};

const sizeStyles = {
  sm: { padding: '6px 12px', fontSize: '12px' },
  md: { padding: '8px 16px', fontSize: '14px' },
  lg: { padding: '12px 24px', fontSize: '16px' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  style = {},
  ...props
}) {
  const [hovered, setHovered] = useState(false);

  const vStyle = variantStyles[variant] || variantStyles.primary;
  const sStyle = sizeStyles[size] || sizeStyles.md;

  const hoverShadow =
    variant === 'primary' && hovered
      ? '0 15px 35px rgba(79,70,229,0.35)'
      : variant === 'danger' && hovered
      ? '0 15px 35px rgba(239,68,68,0.35)'
      : variant === 'success' && hovered
      ? '0 15px 35px rgba(16,185,129,0.35)'
      : variant === 'secondary' && hovered
      ? undefined
      : variant === 'outline' && hovered
      ? undefined
      : undefined;

  const hoverBg =
    variant === 'secondary' && hovered
      ? 'rgba(255,255,255,0.8)'
      : variant === 'outline' && hovered
      ? 'rgba(248,250,252,0.6)'
      : undefined;

  return (
    <button
      className={className}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 500,
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
        filter: variant === 'primary' && hovered && !disabled ? 'brightness(1.1)' : undefined,
        ...vStyle,
        ...sStyle,
        ...(hoverShadow && !disabled ? { boxShadow: hoverShadow } : {}),
        ...(hoverBg && !disabled ? { backgroundColor: hoverBg } : {}),
        ...style,
      }}
      {...props}
    >
      {/* Shimmer overlay for primary variant */}
      {variant === 'primary' && (
        <span
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            transform: hovered ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.7s',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />
      )}
      <span
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {children}
      </span>
    </button>
  );
}
