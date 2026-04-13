const colorMap = {
  blue:    { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid rgba(191,219,254,0.6)' },
  green:   { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid rgba(187,247,208,0.6)' },
  yellow:  { backgroundColor: '#fffbeb', color: '#a16207', border: '1px solid rgba(253,230,138,0.6)' },
  red:     { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid rgba(254,202,202,0.6)' },
  gray:    { backgroundColor: '#f9fafb', color: '#374151', border: '1px solid rgba(229,231,235,0.6)' },
  purple:  { backgroundColor: '#faf5ff', color: '#7e22ce', border: '1px solid rgba(233,213,255,0.6)' },
  cyan:    { backgroundColor: '#ecfeff', color: '#0e7490', border: '1px solid rgba(165,243,252,0.6)' },
  amber:   { backgroundColor: '#fffbeb', color: '#a16207', border: '1px solid rgba(253,230,138,0.6)' },
  emerald: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid rgba(167,243,208,0.6)' },
};

export default function Badge({ children, color = 'gray', className = '', style = {} }) {
  const colorStyle = colorMap[color] || colorMap.gray;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 500,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        ...colorStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
