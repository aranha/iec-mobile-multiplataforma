import type React from 'react';

const btn: React.CSSProperties = {
  border: '1px solid #2a3f55',
  borderRadius: 6,
  padding: '6px 12px',
  background: 'transparent',
  color: '#e0e0e0',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    left: 16,
    right: 16,
    bottom: 80,
    maxWidth: 480,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: '#1c2d40',
    color: '#e0e0e0',
    border: '1px solid #01b4e4',
    borderRadius: 10,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
    fontSize: 14,
    zIndex: 200,
  },
  msg: { flex: 1, fontWeight: 600 },
  btn,
  primary: { ...btn, background: '#01b4e4', border: '1px solid #01b4e4', color: '#0d253f' },
};
