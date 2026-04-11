import React from 'react'

export default function StreamingText({ text, isStreaming, style }) {
  if (!text) return null
  return (
    <div
      style={{
        fontSize: '14px',
        color: 'var(--ps-text)',
        lineHeight: '1.75',
        fontFamily: 'var(--ps-font-sans)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...style
      }}
      className={isStreaming ? 'ps-cursor' : ''}
    >
      {text}
    </div>
  )
}
