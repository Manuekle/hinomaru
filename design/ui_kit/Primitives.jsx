// Shared UI primitives. Exported to window so other JSX files can use them.
const { useState, useEffect, useRef } = React;

// Inline lucide-style icons (1.5px stroke, 24x24)
function Icon({ name, size = 20, color = 'currentColor' }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':     return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>;
    case 'refresh':  return <svg {...props}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
    case 'chart':    return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case 'user':     return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'check':    return <svg {...props}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'x':        return <svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>;
    case 'plus':     return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'arrow-right': return <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case 'arrow-left':  return <svg {...props}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
    case 'volume':   return <svg {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
    case 'shuffle':  return <svg {...props}><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
    case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    case 'bookmark': return <svg {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
    case 'cards':    return <svg {...props}><rect x="3" y="3" width="13" height="16" rx="2"/><path d="M8 7h3m-3 4h6m-6 4h6"/><path d="M21 7v11a2 2 0 0 1-2 2H9"/></svg>;
    case 'type':     return <svg {...props}><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
    case 'pen':      return <svg {...props}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
    case 'speaker':  return <svg {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
    case 'eraser':   return <svg {...props}><path d="M20 20H7L3 16a2 2 0 0 1 0-2.83l10-10a2 2 0 0 1 2.83 0l5.66 5.66a2 2 0 0 1 0 2.83L11 20"/><line x1="18" y1="12.3" x2="11.7" y2="6"/></svg>;
    default: return null;
  }
}

function Button({ children, kind = 'primary', size = 'md', onClick, disabled, full, style, type }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font-ui)', fontWeight: 600, borderRadius: 16,
    border: '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms var(--ease-brand), transform 80ms var(--ease-brand)',
    width: full ? '100%' : undefined,
  };
  const sizes = {
    sm: { height: 36, padding: '0 14px', fontSize: 13, borderRadius: 12 },
    md: { height: 48, padding: '0 24px', fontSize: 16 },
    lg: { height: 56, padding: '0 28px', fontSize: 17 },
  };
  const kinds = {
    primary:   { background: 'var(--hinomaru-red)', color: '#fff' },
    secondary: { background: '#fff', color: 'var(--sumi)', borderColor: 'var(--ink-200)' },
    ghost:     { background: 'transparent', color: 'var(--sumi)' },
    dark:      { background: 'var(--sumi)', color: '#fff' },
  };
  const disabledStyle = disabled ? { background: 'var(--ink-100)', color: 'var(--ink-400)', borderColor: 'transparent' } : {};
  return <button type={type || 'button'} onClick={onClick} disabled={disabled}
    style={{ ...base, ...sizes[size], ...kinds[kind], ...disabledStyle, ...style }}>{children}</button>;
}

function Pill({ children, kind = 'ink' }) {
  const kinds = {
    red:     { background: '#FDECEF', color: '#9A0025' },
    ink:     { background: 'var(--ink-100)', color: 'var(--ink-700)' },
    success: { background: '#E9F3EE', color: '#2E7D5B' },
    outline: { background: 'transparent', color: 'var(--fg-secondary)', border: '1px solid var(--ink-200)' },
  };
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', ...kinds[kind] }}>{children}</span>;
}

function ProgressBar({ value, height = 6, color = 'var(--hinomaru-red)' }) {
  return <div style={{ height, background: 'var(--ink-200)', borderRadius: 999, overflow: 'hidden' }}>
    <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 240ms var(--ease-brand)' }}/>
  </div>;
}

function LogoMark({ size = 20 }) {
  return <div style={{ width: size, height: size, background: 'var(--hinomaru-red)', borderRadius: '50%', flexShrink: 0 }}/>;
}

Object.assign(window, { Icon, Button, Pill, ProgressBar, LogoMark });
