import React from 'react'
import StreamingText from '../shared/StreamingText'
import SectionHeader from '../shared/SectionHeader'
import MatrixVisual from '../shared/MatrixVisual'
import CascadeMap from '../shared/CascadeMap'

const card = {
  background: 'var(--ps-surface)',
  border: '0.5px solid var(--ps-border)',
  borderRadius: 'var(--ps-radius-lg)',
  padding: '1.25rem'
}

const surface = {
  background: 'var(--ps-surface-2)',
  borderRadius: 'var(--ps-radius-md)',
  padding: '1rem'
}

const lensRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem',
  marginTop: '0.75rem'
}

const eyebrow = (color) => ({
  fontSize: '10px',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color,
  marginBottom: '0.3rem',
  fontFamily: 'var(--ps-font-sans)'
})

const lensText = {
  fontSize: '12px',
  color: 'var(--ps-muted)',
  lineHeight: '1.55',
  fontFamily: 'var(--ps-font-sans)'
}

// ─── VERDICT ────────────────────────────────────────────────
export function Verdict({ agent1Text, agent7Text, agent8Text, inputs, parsed, isStreaming }) {
  const conviction = extractConviction(agent8Text)
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="The Verdict" title="Market shape, cascade position, and conviction" />

      {/* Key metrics */}
      {parsed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Signal Power', value: parsed.signalPosition || '...', color: 'var(--ps-signal-bg)', border: 'var(--ps-signal-border)', text: 'var(--ps-signal-text)' },
            { label: 'Trust Reach', value: parsed.trustPosition || '...', color: 'var(--ps-trust-bg)', border: 'var(--ps-trust-border)', text: 'var(--ps-trust-text)' },
            { label: 'Shape Agency', value: parsed.shapePosition || '...', color: 'var(--ps-shape-bg)', border: 'var(--ps-shape-border)', text: 'var(--ps-shape-text)' }
          ].map(m => (
            <div key={m.label} style={{ background: m.color, border: `0.5px solid ${m.border}`, borderRadius: 'var(--ps-radius-md)', padding: '0.875rem' }}>
              <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: m.text, marginBottom: '0.3rem', fontFamily: 'var(--ps-font-sans)' }}>{m.label}</div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: m.text, fontFamily: 'var(--ps-font-sans)' }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Cascade map */}
      {parsed && (
        <div style={{ marginBottom: '1rem' }}>
          <CascadeMap
            signalPos={parsed.signalPosition}
            trustPos={parsed.trustPosition}
            shapePos={parsed.shapePosition}
            breakPoint={parsed.cascadeBreak}
            leveragePoint={parsed.leveragePoint}
          />
        </div>
      )}

      {/* Verdict text */}
      {agent7Text && (
        <div style={{ ...card, marginBottom: '1rem' }}>
          <StreamingText text={extractVerdict(agent7Text)} isStreaming={isStreaming && !agent8Text} />
        </div>
      )}

      {/* Conviction statement */}
      {conviction && (
        <div style={{ background: 'var(--ps-warning-bg)', border: `0.5px solid var(--ps-signal-border)`, borderRadius: 'var(--ps-radius-lg)', padding: '1.25rem 1.5rem' }}>
          <div style={eyebrow('var(--ps-signal)')}>Conviction Statement — deliver in the first 5 minutes</div>
          <div style={{ fontSize: '14px', color: '#4A3010', lineHeight: '1.75', fontStyle: 'italic', fontFamily: 'var(--ps-font)' }}>
            {conviction}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ARCHETYPE ANALYSIS ─────────────────────────────────────
export function ArchetypeAnalysis({ text, archetype, sectionTitle, isStreaming }) {
  if (!text) return null
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow={`Archetype ${archetype} Analysis`} title={sectionTitle} accentColor="var(--ps-signal)" />
      <div style={card}>
        <StreamingText text={text} isStreaming={isStreaming} />
      </div>
    </div>
  )
}

// ─── SIGNAL POWER ───────────────────────────────────────────
export function SignalPower({ text, company, parsed, isStreaming }) {
  const quadrant = parsed?.signalPosition ? posToSignalQuadrant(parsed.signalPosition) : null
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="Dimension 1 of 3" title="Signal Power" accentColor="var(--ps-signal)" />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', alignItems: 'start' }}>
        <MatrixVisual type="signal" activeQuadrant={quadrant} targetQuadrant="compounder" companyName={company} />
        <div>
          <div style={card}>
            <StreamingText text={stripStatusLine(text, 'SIGNAL POWER')} isStreaming={isStreaming} />
          </div>
          <div style={lensRow}>
            <div style={surface}>
              <div style={eyebrow('var(--ps-trust)')}>PM Lens</div>
              <div style={lensText}>{extractLens(text, 'PM LENS')}</div>
            </div>
            <div style={surface}>
              <div style={eyebrow('var(--ps-shape)')}>PMM Lens</div>
              <div style={lensText}>{extractLens(text, 'PMM LENS')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TRUST REACH ────────────────────────────────────────────
export function TrustReach({ text, company, parsed, isStreaming }) {
  const quadrant = parsed?.trustPosition ? posToTrustQuadrant(parsed.trustPosition) : null
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="Dimension 2 of 3" title="Trust Reach" accentColor="var(--ps-trust)" />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', alignItems: 'start' }}>
        <div>
          <MatrixVisual type="trust" activeQuadrant={quadrant} targetQuadrant="delegable" companyName={company} />
          {parsed?.delegabilityRung && (
            <div style={{ ...surface, marginTop: '0.75rem' }}>
              <div style={eyebrow('var(--ps-trust)')}>Delegability Ladder</div>
              <DelegabilityLadder rung={parsed.delegabilityRung} />
            </div>
          )}
        </div>
        <div>
          <div style={card}>
            <StreamingText text={stripStatusLine(text, 'TRUST REACH')} isStreaming={isStreaming} />
          </div>
          <div style={lensRow}>
            <div style={surface}>
              <div style={eyebrow('var(--ps-trust)')}>PM Lens</div>
              <div style={lensText}>{extractLens(text, 'PM LENS')}</div>
            </div>
            <div style={surface}>
              <div style={eyebrow('var(--ps-shape)')}>PMM Lens</div>
              <div style={lensText}>{extractLens(text, 'PMM LENS')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SHAPE AGENCY ───────────────────────────────────────────
export function ShapeAgency({ text, company, parsed, isStreaming }) {
  const quadrant = parsed?.shapePosition ? posToShapeQuadrant(parsed.shapePosition) : null
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="Dimension 3 of 3" title="Shape Agency" accentColor="var(--ps-shape)" />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', alignItems: 'start' }}>
        <MatrixVisual type="shape" activeQuadrant={quadrant} targetQuadrant="shaper" companyName={company} />
        <div>
          <div style={card}>
            <StreamingText text={stripStatusLine(text, 'SHAPE AGENCY')} isStreaming={isStreaming} />
          </div>
          <div style={lensRow}>
            <div style={surface}>
              <div style={eyebrow('var(--ps-trust)')}>PM Lens</div>
              <div style={lensText}>{extractLens(text, 'PM LENS')}</div>
            </div>
            <div style={surface}>
              <div style={eyebrow('var(--ps-shape)')}>PMM Lens</div>
              <div style={lensText}>{extractLens(text, 'PMM LENS')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CATEGORY PRECEDENTS ────────────────────────────────────
export function CategoryPrecedents({ text, isStreaming }) {
  if (!text) return null
  const precedents = extractPrecedents(text)
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="Category Precedents" title="Historical structural parallels — what happened and what transfers" accentColor="var(--ps-signal)" />
      {precedents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {precedents.map((p, i) => (
            <div key={i} style={{ ...card, borderTop: `2px solid ${i === 3 ? '#D85A30' : 'var(--ps-border)'}` }}>
              <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: i === 3 ? '#D85A30' : 'var(--ps-muted)', marginBottom: '0.3rem', fontFamily: 'var(--ps-font-sans)' }}>
                {i === 3 ? 'Archetype Precedent (most important)' : `Precedent ${i + 1} — ${['Signal Power', 'Trust Reach', 'Shape Agency'][i]}`}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ps-text)', lineHeight: '1.6', fontFamily: 'var(--ps-font-sans)' }}>{p}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={card}>
          <StreamingText text={text} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  )
}

// ─── CASCADE DIAGNOSIS ──────────────────────────────────────
export function CascadeDiagnosis({ text, parsed, isStreaming }) {
  if (!text) return null
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="The Cascade Diagnosis" title="Where signal flows into trust into shape — or breaks" accentColor="var(--ps-break)" />
      <div style={card}>
        {parsed?.leveragePoint && (
          <div style={{ background: 'var(--ps-warning-bg)', borderLeft: '3px solid var(--ps-signal)', padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '0 var(--ps-radius-sm) var(--ps-radius-sm) 0', fontSize: '13px', fontWeight: '500', color: 'var(--ps-signal-text)', fontFamily: 'var(--ps-font-sans)' }}>
            Leverage Point: {parsed.leveragePoint}
          </div>
        )}
        <StreamingText text={stripStatusLine(text, 'CASCADE DIAGNOSIS')} isStreaming={isStreaming} />
      </div>
    </div>
  )
}

// ─── MANDATE ────────────────────────────────────────────────
export function Mandate({ text, isStreaming }) {
  if (!text) return null
  const phases = extractPhases(text)
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="The Mandate" title="90-day north star, three phases, the metric that proves it's working" accentColor="var(--ps-signal)" />
      {phases.length === 3 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {phases.map((p, i) => (
            <div key={i} style={{ ...card, borderTop: `2px solid ${['var(--ps-signal)', 'var(--ps-trust)', 'var(--ps-shape)'][i]}` }}>
              <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: ['var(--ps-signal)', 'var(--ps-trust)', 'var(--ps-shape)'][i], marginBottom: '0.35rem', fontFamily: 'var(--ps-font-sans)' }}>
                {['Days 0–30', 'Days 31–60', 'Days 61–90'][i]}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--ps-text)', lineHeight: '1.6', fontFamily: 'var(--ps-font-sans)' }}>{p}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={card}>
          <StreamingText text={text} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  )
}

// ─── STAKEHOLDER FORCE FIELD ─────────────────────────────────
export function StakeholderForceField({ text, isStreaming }) {
  if (!text) return null
  const { supporters, resistors } = extractForceField(text)
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="Stakeholder Force Field" title="Who will push this forward — and who will resist" accentColor="var(--ps-shape)" />
      {supporters && resistors ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ background: 'var(--ps-shape-bg)', border: `0.5px solid var(--ps-shape-border)`, borderRadius: 'var(--ps-radius-lg)', padding: '1rem' }}>
            <div style={eyebrow('var(--ps-shape)')}>Allies — and why</div>
            <div style={{ fontSize: '13px', color: 'var(--ps-shape-text)', lineHeight: '1.65', fontFamily: 'var(--ps-font-sans)' }}>{supporters}</div>
          </div>
          <div style={{ background: 'var(--ps-break-bg)', border: `0.5px solid var(--ps-break-border)`, borderRadius: 'var(--ps-radius-lg)', padding: '1rem' }}>
            <div style={eyebrow('var(--ps-break)')}>Resistors — and how to navigate</div>
            <div style={{ fontSize: '13px', color: 'var(--ps-break-text)', lineHeight: '1.65', fontFamily: 'var(--ps-font-sans)' }}>{resistors}</div>
          </div>
        </div>
      ) : (
        <div style={card}>
          <StreamingText text={text} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  )
}

// ─── VOCABULARY KIT ──────────────────────────────────────────
export function VocabularyKit({ text, isStreaming }) {
  if (!text) return null
  const terms = extractVocab(text)
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="Vocabulary Kit" title="5 phrases to introduce into internal conversations" accentColor="var(--ps-trust)" />
      {terms.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {terms.map((t, i) => (
            <div key={i} style={{ ...card, gridColumn: i === 4 ? 'span 2' : 'span 1' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ps-trust)', marginBottom: '0.25rem', fontFamily: 'var(--ps-font-sans)' }}>{t.term}</div>
              <div style={{ fontSize: '12px', color: 'var(--ps-muted)', lineHeight: '1.55', fontFamily: 'var(--ps-font-sans)' }}>{t.definition}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={card}>
          <StreamingText text={text} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  )
}

// ─── UNASKED QUESTION ────────────────────────────────────────
export function UnaskedQuestion({ text, isStreaming }) {
  if (!text) return null
  const { question, why } = extractUnasked(text)
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="The Unasked Question" title="What this company should be asking internally — but almost certainly isn't" accentColor="var(--ps-signal)" />
      <div style={card}>
        {question ? (
          <>
            <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--ps-text)', lineHeight: '1.5', fontStyle: 'italic', marginBottom: '0.75rem', fontFamily: 'var(--ps-font)' }}>
              "{question}"
            </div>
            {why && <div style={{ fontSize: '13px', color: 'var(--ps-muted)', lineHeight: '1.7', fontFamily: 'var(--ps-font-sans)' }}>{why}</div>}
          </>
        ) : (
          <StreamingText text={text} isStreaming={isStreaming} />
        )}
      </div>
    </div>
  )
}

// ─── CONTRARIAN VIEW ─────────────────────────────────────────
export function ContrarianView({ text, isStreaming }) {
  if (!text) return null
  return (
    <div className="ps-section ps-fade-in" style={{ marginBottom: '2rem' }}>
      <SectionHeader eyebrow="The Contrarian View" title="What this analysis might be getting wrong" accentColor="var(--ps-break)" />
      <div style={{ background: 'var(--ps-break-bg)', border: `0.5px solid var(--ps-break-border)`, borderRadius: 'var(--ps-radius-lg)', padding: '1.5rem' }}>
        <StreamingText
          text={extractContrarian(text)}
          isStreaming={isStreaming}
          style={{ color: 'var(--ps-break-text)' }}
        />
      </div>
    </div>
  )
}

// ─── DELEGABILITY LADDER VISUAL ──────────────────────────────
function DelegabilityLadder({ rung }) {
  const rungs = [
    'Trust the answer',
    'Trust to draft',
    'Trust to act',
    'Trust to decide'
  ]
  return (
    <div style={{ marginTop: '0.5rem' }}>
      {rungs.map((r, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 0',
          opacity: i < rung ? 1 : 0.4
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: i < rung ? 'var(--ps-trust)' : 'var(--ps-border-strong)',
            flexShrink: 0
          }} />
          <span style={{ fontSize: '11px', color: i < rung ? 'var(--ps-trust-text)' : 'var(--ps-muted)', fontFamily: 'var(--ps-font-sans)' }}>
            Rung {i + 1}: {r}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── EXTRACTION HELPERS ──────────────────────────────────────

function extractVerdict(text) {
  if (!text) return ''
  const match = text.match(/5\.\s*THE VERDICT\s*([\s\S]*?)(?:\n\nCASCADE|$)/i)
  return match ? match[1].trim() : text.slice(0, 600)
}

function extractConviction(text) {
  if (!text) return ''
  // Try numbered section first
  const numbered = text.match(/7\.\s*THE CONVICTION STATEMENT\s*([\s\S]*?)(?:\nMANDATE COMPLETE|$)/i)
  if (numbered) return numbered[1].trim()
  // Try heading-only
  const headed = text.match(/THE CONVICTION STATEMENT\s*([\s\S]*?)(?:\nMANDATE COMPLETE|$)/i)
  if (headed) return headed[1].trim()
  // Last resort — look for first-person paragraph ending with question
  const firstPerson = text.match(/("I [^"]+\?")/i)
  if (firstPerson) return firstPerson[1]
  return ''
}

function extractLens(text, lensType) {
  if (!text) return ''
  const regex = new RegExp(`${lensType}\\s*([\\s\\S]*?)(?:\\n\\d+\\.|THE SIGNAL MOVE|THE TRUST MOVE|THE SHAPE MOVE|SIGNAL POWER:|TRUST REACH:|SHAPE AGENCY:|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim().slice(0, 300) : ''
}

function extractContrarian(text) {
  if (!text) return text
  const match = text.match(/(?:CONTRARIAN VIEW|WHAT THIS ANALYSIS|THE CONTRARIAN)\s*([\s\S]*?)(?:\nMANDATE COMPLETE|$)/i)
  return match ? match[1].trim() : text
}

function extractPrecedents(text) {
  const precedents = []
  const regex = /PRECEDENT\s+\d+[^\n]*\n([\s\S]*?)(?=PRECEDENT\s+\d+|PRECEDENTS COMPLETE|$)/gi
  let match
  while ((match = regex.exec(text)) !== null) {
    precedents.push(match[1].trim())
  }
  return precedents.slice(0, 4)
}

function extractPhases(text) {
  if (!text) return []
  const phases = []

  // Try numbered section approach first (most reliable)
  const numbered = [
    /2\.\s*THE 30.60.90 PLAN[\s\S]*?(?:Phase 1|Days? 0.30|First)[^\n]*\n([\s\S]*?)(?=(?:Phase 2|Days? 3[01]|Second)|THE METRIC|$)/i,
    /(?:Phase 2|Days? 3[01].60|Second phase)[^\n]*\n([\s\S]*?)(?=(?:Phase 3|Days? 6[01]|Third phase)|THE METRIC|$)/i,
    /(?:Phase 3|Days? 6[01].90|Third phase)[^\n]*\n([\s\S]*?)(?=THE METRIC|3\.\s*THE METRIC|THE STAKEHOLDER|MANDATE COMPLETE|$)/i
  ]

  numbered.forEach(p => {
    const m = text.match(p)
    if (m) phases.push(m[1].trim().slice(0, 500))
  })

  // If numbered approach only got 1-2, try splitting on phase headers
  if (phases.length < 3) {
    const splitMatch = text.match(/(?:THE 30.60.90 PLAN|30-60-90)([\s\S]*?)(?=THE METRIC|3\.\s*THE METRIC|$)/i)
    if (splitMatch) {
      const block = splitMatch[1]
      const parts = block.split(/(?=(?:Phase [123]|Days? \d|First phase|Second phase|Third phase))/i)
        .filter(p => p.trim().length > 50)
        .slice(0, 3)
      if (parts.length === 3) return parts.map(p => p.trim().slice(0, 500))
    }
  }

  return phases
}

function extractForceField(text) {
  const supMatch = text.match(/(?:ALLIES|SUPPORTERS|WHO WILL PUSH)[^\n]*\n([\s\S]*?)(?=(?:RESISTORS|WHO WILL RESIST)|VOCABULARY|MANDATE COMPLETE|$)/i)
  const resMatch = text.match(/(?:RESISTORS|WHO WILL RESIST)[^\n]*\n([\s\S]*?)(?=VOCABULARY|THE VOCABULARY|MANDATE COMPLETE|$)/i)
  return {
    supporters: supMatch ? supMatch[1].trim().slice(0, 500) : null,
    resistors: resMatch ? resMatch[1].trim().slice(0, 500) : null
  }
}

function extractVocab(text) {
  const terms = []
  const regex = /(?:\d+\.\s+)?["']?([A-Z][a-zA-Z\s\/]+)["']?\s*[-–]\s*([^\n]+(?:\n(?!\d+\.|VOCABULARY|UNASKED)[^\n]+)*)/g
  let match
  let count = 0
  while ((match = regex.exec(text)) !== null && count < 5) {
    const term = match[1].trim()
    const def = match[2].trim()
    if (term.length < 50 && def.length > 20) {
      terms.push({ term, definition: def.slice(0, 200) })
      count++
    }
  }
  return terms
}

function extractUnasked(text) {
  if (!text) return {}
  const qMatch = text.match(/["']([^"']+\?)['"]/i)
  const whyMatch = text.match(/(?:This question is|Why it is|invisible|internally)[^\n]*([\s\S]*?)(?=MANDATE COMPLETE|CONTRARIAN|$)/i)
  return {
    question: qMatch ? qMatch[1].trim() : null,
    why: whyMatch ? whyMatch[0].trim().slice(0, 500) : null
  }
}

function stripStatusLine(text, prefix) {
  if (!text) return ''
  return text.replace(new RegExp(`${prefix}:[^\n]+`, 'i'), '').trim()
}

function posToSignalQuadrant(pos) {
  const p = (pos || '').toLowerCase()
  if (p.includes('compounder')) return 'compounder'
  if (p.includes('leaking')) return 'leaking'
  if (p.includes('infrastructure')) return 'infrastructure'
  return 'exposed'
}

function posToTrustQuadrant(pos) {
  const p = (typeof pos === 'string' ? pos : pos?.position || '').toLowerCase()
  if (p.includes('delegable')) return 'delegable'
  if (p.includes('brittle') || (p.includes('high') && p.includes('low'))) return 'brittle'
  if (p.includes('thin') || p.includes('wide')) return 'thin'
  return 'deficit'
}

function posToShapeQuadrant(pos) {
  const p = (typeof pos === 'string' ? pos : pos?.position || '').toLowerCase()
  if (p.includes('shaper')) return 'shaper'
  if (p.includes('laggard')) return 'laggard'
  if (p.includes('lucky')) return 'lucky'
  return 'follower'
}
