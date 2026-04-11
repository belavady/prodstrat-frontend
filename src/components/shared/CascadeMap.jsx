import React from 'react'

export default function CascadeMap({ signalPos, trustPos, shapePos, breakPoint, leveragePoint }) {
  const getStrength = (pos) => {
    if (!pos) return 'unknown'
    const p = (typeof pos === 'string' ? pos : pos.position || '').toLowerCase()
    if (p.includes('compounder') || p.includes('delegable') || p.includes('shaper')) return 'strong'
    if (p.includes('leaking') || p.includes('thin') || p.includes('laggard')) return 'medium'
    return 'weak'
  }

  const nodeStyle = (strength, isLeverage) => {
    const base = {
      strong:  { fill: '#E1F5EE', stroke: '#1D9E75', textColor: '#085041', subColor: '#0F6E56' },
      medium:  { fill: '#FDF3E7', stroke: '#BA7517', textColor: '#412402', subColor: '#854F0B' },
      weak:    { fill: '#FAECE7', stroke: '#F0997B', textColor: '#4A1B0C', subColor: '#993C1D' },
      unknown: { fill: '#F1EFE8', stroke: '#B4B2A9', textColor: '#2C2C2A', subColor: '#888780' }
    }
    const s = base[strength] || base.unknown
    if (isLeverage) s.stroke = '#D85A30'
    return s
  }

  const sigStr = getStrength(signalPos)
  const truStr = getStrength(trustPos)
  const shaStr = getStrength(shapePos)

  const isLeverageSignal = leveragePoint?.toLowerCase().includes('signal')
  const isLeverageTrust  = leveragePoint?.toLowerCase().includes('trust')
  const isLeverageShape  = leveragePoint?.toLowerCase().includes('shape')

  const sigStyle = nodeStyle(sigStr, isLeverageSignal)
  const truStyle = nodeStyle(truStr, isLeverageTrust)
  const shaStyle = nodeStyle(shaStr, isLeverageShape)

  const breakST = breakPoint === 'signal-trust'
  const breakTS = breakPoint === 'trust-shape'

  const sigLabel = typeof signalPos === 'string' ? signalPos : 'Assessing...'
  const truLabel = typeof trustPos === 'string' ? trustPos : (trustPos?.position || 'Assessing...')
  const shaLabel = typeof shapePos === 'string' ? shapePos : (shapePos?.position || 'Assessing...')

  return (
    <svg
      width="100%"
      viewBox="0 0 680 110"
      role="img"
      aria-label="STS cascade diagram showing Signal, Trust, and Shape positions"
      style={{ display: 'block', marginBottom: '0.75rem' }}
    >
      <defs>
        <marker id="cascadeArrow" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </marker>
      </defs>

      {/* Signal node */}
      <rect x="20" y="18" width="172" height="74" rx="8"
        fill={sigStyle.fill} stroke={sigStyle.stroke}
        strokeWidth={isLeverageSignal ? 2 : 0.5} />
      <text x="106" y="44" textAnchor="middle" fontSize="13" fontWeight="500"
        fill={sigStyle.textColor} fontFamily="-apple-system, sans-serif">
        Signal Power
      </text>
      <text x="106" y="62" textAnchor="middle" fontSize="10"
        fill={sigStyle.subColor} fontFamily="-apple-system, sans-serif">
        {sigLabel.length > 28 ? sigLabel.slice(0, 28) + '...' : sigLabel}
      </text>
      {isLeverageSignal && (
        <text x="106" y="80" textAnchor="middle" fontSize="9" fontWeight="500"
          fill="#D85A30" fontFamily="-apple-system, sans-serif">
          Leverage Point
        </text>
      )}

      {/* Arrow 1 */}
      {breakST ? (
        <>
          <line x1="194" y1="55" x2="234" y2="55"
            stroke="#E24B4A" strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd="url(#cascadeArrow)" />
          <text x="214" y="46" textAnchor="middle" fontSize="10"
            fontWeight="500" fill="#A32D2D"
            fontFamily="-apple-system, sans-serif">
            BREAK
          </text>
        </>
      ) : (
        <line x1="194" y1="55" x2="234" y2="55"
          stroke="#888780" strokeWidth="1.5"
          markerEnd="url(#cascadeArrow)" />
      )}

      {/* Trust node */}
      <rect x="238" y="18" width="200" height="74" rx="8"
        fill={truStyle.fill} stroke={truStyle.stroke}
        strokeWidth={isLeverageTrust ? 2 : 0.5} />
      <text x="338" y="44" textAnchor="middle" fontSize="13" fontWeight="500"
        fill={truStyle.textColor} fontFamily="-apple-system, sans-serif">
        Trust Reach
      </text>
      <text x="338" y="62" textAnchor="middle" fontSize="10"
        fill={truStyle.subColor} fontFamily="-apple-system, sans-serif">
        {truLabel.length > 32 ? truLabel.slice(0, 32) + '...' : truLabel}
      </text>
      {isLeverageTrust && (
        <text x="338" y="80" textAnchor="middle" fontSize="9" fontWeight="500"
          fill="#D85A30" fontFamily="-apple-system, sans-serif">
          Leverage Point
        </text>
      )}

      {/* Arrow 2 */}
      {breakTS ? (
        <>
          <line x1="440" y1="55" x2="478" y2="55"
            stroke="#E24B4A" strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd="url(#cascadeArrow)" />
          <text x="459" y="46" textAnchor="middle" fontSize="10"
            fontWeight="500" fill="#A32D2D"
            fontFamily="-apple-system, sans-serif">
            BREAK
          </text>
        </>
      ) : (
        <line x1="440" y1="55" x2="478" y2="55"
          stroke="#888780" strokeWidth="1.5"
          markerEnd="url(#cascadeArrow)" />
      )}

      {/* Shape node */}
      <rect x="482" y="18" width="178" height="74" rx="8"
        fill={shaStyle.fill} stroke={shaStyle.stroke}
        strokeWidth={isLeverageShape ? 2 : 0.5} />
      <text x="571" y="44" textAnchor="middle" fontSize="13" fontWeight="500"
        fill={shaStyle.textColor} fontFamily="-apple-system, sans-serif">
        Shape Agency
      </text>
      <text x="571" y="62" textAnchor="middle" fontSize="10"
        fill={shaStyle.subColor} fontFamily="-apple-system, sans-serif">
        {shaLabel.length > 28 ? shaLabel.slice(0, 28) + '...' : shaLabel}
      </text>
      {isLeverageShape && (
        <text x="571" y="80" textAnchor="middle" fontSize="9" fontWeight="500"
          fill="#D85A30" fontFamily="-apple-system, sans-serif">
          Leverage Point
        </text>
      )}
    </svg>
  )
}
