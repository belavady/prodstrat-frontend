import React from 'react'

const MATRIX_CONFIGS = {
  signal: {
    xAxis: 'Signal Ownership',
    yAxis: 'Signal Density',
    quadrants: {
      topLeft:     { label: 'Leaking',        color: '#F7F6F3', border: '#D3D1C7', textColor: '#5F5E5A', example: 'Data exists, value escapes' },
      topRight:    { label: 'Compounder',      color: '#EAF3DE', border: '#97C459', textColor: '#3B6D11', example: 'Spotify, Google Maps' },
      bottomLeft:  { label: 'Exposed',         color: '#FAECE7', border: '#F0997B', textColor: '#712B13', example: 'Most dangerous position' },
      bottomRight: { label: 'Infrastructure',  color: '#F7F6F3', border: '#D3D1C7', textColor: '#5F5E5A', example: 'Rich infra, thin surface' }
    },
    positions: {
      compounder: 'topRight', leaking: 'topLeft',
      exposed: 'bottomLeft', infrastructure: 'bottomRight'
    }
  },
  trust: {
    xAxis: 'Trust Elasticity',
    yAxis: 'Trust Depth',
    quadrants: {
      topLeft:     { label: 'Deep but Brittle', color: '#EBF3FC', border: '#9FC5ED', textColor: '#0C447C', example: 'Strong trust, narrow context' },
      topRight:    { label: 'Delegable Trust',  color: '#EAF3DE', border: '#97C459', textColor: '#3B6D11', example: 'Google Maps, Spotify' },
      bottomLeft:  { label: 'Trust Deficit',    color: '#F7F6F3', border: '#D3D1C7', textColor: '#5F5E5A', example: 'Starting from scratch' },
      bottomRight: { label: 'Thin but Wide',    color: '#F7F6F3', border: '#D3D1C7', textColor: '#5F5E5A', example: 'ChatGPT consumer' }
    },
    positions: {
      delegable: 'topRight', brittle: 'topLeft',
      thin: 'bottomRight', deficit: 'bottomLeft'
    }
  },
  shape: {
    xAxis: 'Causal Power',
    yAxis: 'Category Awareness',
    quadrants: {
      topLeft:     { label: 'Aware Laggard',   color: '#E1F5EE', border: '#5DCAA5', textColor: '#085041', example: 'Sees problem, not acting' },
      topRight:    { label: 'Category Shaper', color: '#EAF3DE', border: '#97C459', textColor: '#3B6D11', example: 'OpenAI, Figma' },
      bottomLeft:  { label: 'Follower',        color: '#F7F6F3', border: '#D3D1C7', textColor: '#5F5E5A', example: 'Reactive, price-taker' },
      bottomRight: { label: 'Lucky Leader',    color: '#FBEAF0', border: '#ED93B1', textColor: '#72243E', example: 'Winning without knowing why' }
    },
    positions: {
      shaper: 'topRight', laggard: 'topLeft',
      lucky: 'bottomRight', follower: 'bottomLeft'
    }
  }
}

export default function MatrixVisual({ type, activeQuadrant, companyName, targetQuadrant }) {
  const config = MATRIX_CONFIGS[type]
  if (!config) return null

  const activeKey = config.positions[activeQuadrant] || 'bottomLeft'
  const targetKey = config.positions[targetQuadrant]

  const W = 320
  const H = 260
  const midX = W / 2
  const midY = H / 2
  const pad = 4

  const quadrantRects = {
    topLeft:     { x: pad,      y: pad,      w: midX - pad - 1, h: midY - pad - 1 },
    topRight:    { x: midX + 1, y: pad,      w: midX - pad - 1, h: midY - pad - 1 },
    bottomLeft:  { x: pad,      y: midY + 1, w: midX - pad - 1, h: midY - pad - 1 },
    bottomRight: { x: midX + 1, y: midY + 1, w: midX - pad - 1, h: midY - pad - 1 }
  }

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${type} matrix showing ${companyName} position`}
      style={{ display: 'block', maxWidth: '320px' }}
    >
      <title>{`${type} dimension matrix`}</title>

      {/* Axis labels */}
      <text x={midX} y={H - 2} textAnchor="middle"
        fontSize="9" fill="var(--ps-muted)"
        fontFamily="var(--ps-font-sans)">
        {config.xAxis} →
      </text>
      <text x={8} y={midY} textAnchor="middle"
        fontSize="9" fill="var(--ps-muted)"
        fontFamily="var(--ps-font-sans)"
        transform={`rotate(-90, 8, ${midY})`}>
        {config.yAxis} →
      </text>

      {/* Render quadrants */}
      {Object.entries(quadrantRects).map(([key, rect]) => {
        const q = config.quadrants[key]
        const isActive = key === activeKey
        const isTarget = key === targetKey
        return (
          <g key={key}>
            <rect
              x={rect.x} y={rect.y}
              width={rect.w} height={rect.h}
              rx="5"
              fill={q.color}
              stroke={isActive ? '#D85A30' : q.border}
              strokeWidth={isActive ? 1.5 : 0.5}
            />
            <text
              x={rect.x + rect.w / 2}
              y={rect.y + rect.h / 2 - 10}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill={q.textColor}
              fontFamily="var(--ps-font-sans)"
            >
              {q.label}
            </text>
            <text
              x={rect.x + rect.w / 2}
              y={rect.y + rect.h / 2 + 6}
              textAnchor="middle"
              fontSize="9"
              fill={q.textColor}
              fontFamily="var(--ps-font-sans)"
              opacity="0.8"
            >
              {q.example}
            </text>
            {isActive && (
              <>
                <circle
                  cx={rect.x + rect.w / 2}
                  cy={rect.y + rect.h - 16}
                  r={5}
                  fill="#D85A30"
                />
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h - 4}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="500"
                  fill="#D85A30"
                  fontFamily="var(--ps-font-sans)"
                >
                  {companyName}
                </text>
              </>
            )}
            {isTarget && !isActive && (
              <text
                x={rect.x + rect.w - 8}
                y={rect.y + 14}
                textAnchor="end"
                fontSize="8"
                fill="#1D9E75"
                fontFamily="var(--ps-font-sans)"
              >
                Target
              </text>
            )}
          </g>
        )
      })}

      {/* Axis lines */}
      <line x1={midX} y1={pad} x2={midX} y2={H - 14}
        stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
      <line x1={pad} y1={midY} x2={W - pad} y2={midY}
        stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
    </svg>
  )
}
