import React from 'react'

export default function SectionHeader({ eyebrow, title, accentColor }) {
  const borderColor = accentColor || 'var(--ps-signal)'
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {eyebrow && (
        <div style={{
          fontSize: '10px',
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: 'var(--ps-muted)',
          marginBottom: '0.4rem',
          fontFamily: 'var(--ps-font-sans)'
        }}>
          {eyebrow}
        </div>
      )}
      <div style={{
        fontSize: '18px',
        fontWeight: '500',
        color: 'var(--ps-text)',
        lineHeight: '1.4',
        borderLeft: `3px solid ${borderColor}`,
        paddingLeft: '12px',
        fontFamily: 'var(--ps-font-sans)'
      }}>
        {title}
      </div>
    </div>
  )
}
