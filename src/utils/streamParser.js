// Extracts structured data from agent outputs
// for populating matrix visuals and cascade map

export function parseSignalPosition(text) {
  if (!text) return null
  const match = text.match(/SIGNAL POWER:\s*([^\n]+)/i)
  return match ? match[1].trim() : null
}

export function parseTrustPosition(text) {
  if (!text) return null
  const matchPos = text.match(/TRUST REACH:\s*([^\n--]+)/i)
  const matchRung = text.match(/DELEGABILITY RUNG\s*(\d)/i)
  return {
    position: matchPos ? matchPos[1].trim() : null,
    rung: matchRung ? parseInt(matchRung[1]) : null
  }
}

export function parseShapePosition(text) {
  if (!text) return null
  const matchPos = text.match(/SHAPE AGENCY:\s*([^\n--]+)/i)
  const matchComp = text.match(/COMPOSABILITY:\s*([^\n]+)/i)
  return {
    position: matchPos ? matchPos[1].trim() : null,
    composability: matchComp ? matchComp[1].trim() : null
  }
}

export function parseCascade(text) {
  if (!text) return null
  const match = text.match(/LEVERAGE POINT:\s*([^\n]+)/i)
  return match ? match[1].trim() : null
}

export function parseArchetypeEndline(text, archetype) {
  if (!text) return {}
  const result = {}

  if (archetype === 'A') {
    const wedge = text.match(/WEDGE:\s*([^\n]+)/i)
    const chasm = text.match(/CHASM TYPE:\s*([^\n--]+)/i)
    if (wedge) result.wedge = wedge[1].trim()
    if (chasm) result.chasmType = chasm[1].trim()
  }
  if (archetype === 'B') {
    const surface = text.match(/AGENTIC SURFACE AREA:\s*([^\n--]+)/i)
    const bypass = text.match(/BYPASS RISK:\s*([^\n--]+)/i)
    if (surface) result.agenticSurface = surface[1].trim()
    if (bypass) result.bypassRisk = bypass[1].trim()
  }
  if (archetype === 'C') {
    const window = text.match(/WINDOW:\s*([^\n--]+)/i)
    const workflow = text.match(/TARGET WORKFLOW:\s*([^\n--]+)/i)
    const speed = text.match(/SPEED:\s*([^\n]+)/i)
    if (window) result.window = window[1].trim()
    if (workflow) result.targetWorkflow = workflow[1].trim()
    if (speed) result.speed = speed[1].trim()
  }
  if (archetype === 'D') {
    const layer = text.match(/LAYER:\s*([^\n--]+)/i)
    const risk = text.match(/COMMODITISATION RISK:\s*([^\n--]+)/i)
    if (layer) result.layer = layer[1].trim()
    if (risk) result.commoditisationRisk = risk[1].trim()
  }
  if (archetype === 'E') {
    const moat = text.match(/MOAT STRENGTH:\s*([^\n--]+)/i)
    const threat = text.match(/CHALLENGER THREAT:\s*([^\n]+)/i)
    if (moat) result.moatStrength = moat[1].trim()
    if (threat) result.challengerThreat = threat[1].trim()
  }
  if (archetype === 'F') {
    const disint = text.match(/DISINTERMEDIATION RISK:\s*([^\n--]+)/i)
    const accum = text.match(/ECOSYSTEM ACCUMULATION:\s*([^\n--]+)/i)
    if (disint) result.disintermediationRisk = disint[1].trim()
    if (accum) result.ecosystemAccumulation = accum[1].trim()
  }
  return result
}

// Determine cascade break point from positions
export function detectBreakPoint(signalPos, trustPos, shapePos) {
  if (!signalPos) return null
  const sigLower = signalPos.toLowerCase()
  const trustLower = (trustPos?.position || '').toLowerCase()

  if (sigLower.includes('exposed') || sigLower.includes('leaking')) {
    return 'signal-trust'
  }
  if (trustLower.includes('brittle') || trustLower.includes('low elasticity')) {
    return 'trust-shape'
  }
  return null
}

// Map position string to quadrant key for matrix
export function positionToQuadrant(posStr) {
  if (!posStr) return null
  const p = posStr.toLowerCase()
  if (p.includes('compounder')) return 'compounder'
  if (p.includes('leaking')) return 'leaking'
  if (p.includes('exposed')) return 'exposed'
  if (p.includes('infrastructure')) return 'infrastructure'
  if (p.includes('delegable')) return 'delegable'
  if (p.includes('brittle') || (p.includes('high depth') && p.includes('low'))) return 'brittle'
  if (p.includes('thin') || p.includes('wide')) return 'thin'
  if (p.includes('deficit')) return 'deficit'
  if (p.includes('shaper')) return 'shaper'
  if (p.includes('aware laggard') || p.includes('laggard')) return 'laggard'
  if (p.includes('lucky')) return 'lucky'
  if (p.includes('follower')) return 'follower'
  return 'unknown'
}
