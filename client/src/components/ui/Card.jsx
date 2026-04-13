export default function Card({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
        transition: 'all 0.3s',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{
        padding: '20px 24px',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
