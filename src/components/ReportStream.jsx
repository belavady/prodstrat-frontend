import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AGENT_LABELS, ARCHETYPE_SECTION_TITLES } from '../utils/archetypeConfig'
import { parseSignalPosition, parseTrustPosition, parseShapePosition, parseCascade, parseArchetypeEndline, detectBreakPoint } from '../utils/streamParser'
import {
  Verdict, ArchetypeAnalysis, SignalPower, TrustReach, ShapeAgency,
  CategoryPrecedents, CascadeDiagnosis, Mandate, StakeholderForceField,
  VocabularyKit, UnaskedQuestion, ContrarianView
} from './sections'

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

export default function ReportStream({ inputs, onReset, onForceRerun }) {
  const [sections, setSections] = useState({})
  const [currentAgent, setCurrentAgent] = useState(null)
  const [completedAgents, setCompletedAgents] = useState([])
  const [connectionState, setConnectionState] = useState('connecting')
  const [parsed, setParsed] = useState({})
  const [cacheWarning, setCacheWarning] = useState(null)
  const [progress, setProgress] = useState(0)
  const esRef = useRef(null)
  const bufferRef = useRef({})

  const totalAgents = 9 // 1 + 1 archetype + 7 core

  const updateParsed = useCallback((agentId, text) => {
    if (!text) return
    setParsed(prev => {
      const next = { ...prev }
      if (agentId === 'agent3' || agentId?.startsWith('agent3')) {
        next.signalPosition = parseSignalPosition(text)
      }
      if (agentId === 'agent4') {
        const t = parseTrustPosition(text)
        next.trustPosition = t?.position
        next.delegabilityRung = t?.rung
      }
      if (agentId === 'agent5') {
        const s = parseShapePosition(text)
        next.shapePosition = s?.position
        next.composability = s?.composability
      }
      if (agentId === 'agent7') {
        next.leveragePoint = parseCascade(text)
      }
      if (agentId?.startsWith('agent2')) {
        const extras = parseArchetypeEndline(text, inputs.archetype)
        Object.assign(next, extras)
      }
      // Detect break point whenever signal or trust updates
      next.cascadeBreak = detectBreakPoint(next.signalPosition, next.trustPosition, next.shapePosition)
      return next
    })
  }, [inputs.archetype])

  const loadCachedReport = useCallback((data) => {
    if (!data?.outputs) return
    const o = data.outputs
    setSections({
      agent1: o.agent1 || '',
      agent2: o.agent2 || '',
      agent3: o.agent3 || '',
      agent4: o.agent4 || '',
      agent5: o.agent5 || '',
      agent6: o.agent6 || '',
      agent7: o.agent7 || '',
      agent8: o.agent8 || ''
    })
    if (data.parsed) {
      setParsed(data.parsed)
    } else {
      // Re-parse from outputs if parsed not stored
      if (o.agent3) updateParsed('agent3', o.agent3)
      if (o.agent4) updateParsed('agent4', o.agent4)
      if (o.agent5) updateParsed('agent5', o.agent5)
      if (o.agent7) updateParsed('agent7', o.agent7)
      if (o.agent2) updateParsed('agent2', o.agent2)
    }
    setProgress(100)
    setConnectionState('complete')
  }, [updateParsed])

  useEffect(() => {
    bufferRef.current = {}

    // If report was preloaded from history, render immediately
    if (inputs._preloaded) {
      loadCachedReport(inputs._preloaded)
      return
    }

    const controller = new AbortController()
    esRef.current = controller

    async function streamReport() {
      try {
        const res = await fetch(`${API}/api/report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
          signal: controller.signal
        })

        if (!res.ok) throw new Error(`Server error: ${res.status}`)

        setConnectionState('streaming')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            let event
            try { event = JSON.parse(raw) } catch { continue }

            if (event.type === 'heartbeat') continue

            if (event.type === 'cache_warning') {
              setCacheWarning(event)
              controller.abort()
              return
            }

            if (event.type === 'cached') {
              loadCachedReport(event.data)
              controller.abort()
              return
            }

            if (event.type === 'thinking') {
              setCurrentAgent(event.section)
            }

            if (event.type === 'token' && event.section) {
              const id = event.section
              bufferRef.current[id] = (bufferRef.current[id] || '') + (event.token || '')
              setSections(prev => ({
                ...prev,
                [id]: bufferRef.current[id]
              }))
            }

            if (event.type === 'done' && event.section) {
              const id = event.section
              const text = bufferRef.current[id] || ''
              updateParsed(id, text)
              setCompletedAgents(prev => [...prev, id])
              setProgress(prev => Math.min(99, prev + Math.floor(100 / totalAgents)))
            }

            if (event.type === 'complete') {
              if (event.parsed) setParsed(p => ({ ...p, ...event.parsed }))
              setProgress(100)
              setConnectionState('complete')
              setCurrentAgent(null)
            }

            if (event.type === 'error') {
              setConnectionState('error')
              setCurrentAgent(null)
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setConnectionState('error')
          console.error('Stream error:', err)
        }
      }
    }

    streamReport()

    return () => controller.abort()
  }, [inputs, loadCachedReport, updateParsed])

  const handleCacheView = () => {
    if (cacheWarning?.data) {
      loadCachedReport(cacheWarning.data)
      setCacheWarning(null)
    }
  }

  const handleCacheRerun = () => {
    setCacheWarning(null)
    onForceRerun(inputs)
  }

  const isStreaming = connectionState === 'streaming'
  const company = inputs.company
  const archetype = inputs.archetype
  const archetypeTitle = ARCHETYPE_SECTION_TITLES[archetype] || 'Archetype Analysis'

  return (
    <div style={{ width: '100%', maxWidth: '900px' }}>

      {/* Cache warning modal */}
      {cacheWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--ps-surface)', borderRadius: '14px',
            padding: '2rem', maxWidth: '420px', width: '90%',
            border: '0.5px solid var(--ps-border-strong)'
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
              color: cacheWarning.cacheStatus === 'stale' ? '#A32D2D' : '#8B5A1A',
              marginBottom: '0.5rem', fontFamily: 'var(--ps-font-sans)'
            }}>
              {cacheWarning.cacheStatus === 'stale' ? 'Report may be outdated' : 'Cached report available'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--ps-text)', marginBottom: '0.75rem', fontFamily: 'var(--ps-font-sans)' }}>
              This report is {cacheWarning.ageDays} days old.
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ps-muted)', marginBottom: '1.5rem', fontFamily: 'var(--ps-font-sans)', lineHeight: '1.6' }}>
              {cacheWarning.cacheStatus === 'stale'
                ? 'Significant developments may have occurred. Consider re-running for current intelligence.'
                : 'AI markets move fast. The cached analysis may still be accurate, or conditions may have shifted.'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCacheView} style={btnSecondary}>View Cached</button>
              <button onClick={handleCacheRerun} style={btnPrimary}>Re-run Fresh</button>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {(isStreaming || connectionState === 'connecting') && (
        <div style={{ marginBottom: '2rem' }} className="ps-no-print">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--ps-muted)', fontFamily: 'var(--ps-font-sans)' }}>
              {currentAgent ? AGENT_LABELS[currentAgent] || 'Processing...' : 'Connecting...'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ps-hint)', fontFamily: 'var(--ps-font-sans)' }}>
              {progress}%
            </div>
          </div>
          <div style={{ height: '3px', background: 'var(--ps-surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'var(--ps-text)',
              borderRadius: '2px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      )}

      {/* Error state */}
      {connectionState === 'error' && (
        <div style={{ background: 'var(--ps-break-bg)', border: `0.5px solid var(--ps-break-border)`, borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '14px', color: 'var(--ps-break-text)', marginBottom: '0.75rem', fontFamily: 'var(--ps-font-sans)' }}>
            Connection lost{completedAgents.length > 0 ? ` after ${completedAgents.length} agents completed` : ''}. Partial report shown below.
          </div>
          <button onClick={onReset} style={btnSecondary}>Start over</button>
        </div>
      )}

      {/* Report header */}
      {(sections.agent1 || isStreaming) && (
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '0.5px solid var(--ps-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '22px', fontWeight: '500', fontFamily: 'var(--ps-font-sans)', letterSpacing: '-0.5px' }}>
              Prod<span style={{ color: 'var(--ps-signal)' }}>Strat</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {connectionState === 'complete' && (
                <>
                  <button onClick={() => window.print()} style={{ ...btnSecondary, fontSize: '12px' }} className="ps-no-print">
                    Export PDF
                  </button>
                  <button onClick={onReset} style={{ ...btnSecondary, fontSize: '12px' }} className="ps-no-print">
                    New Report
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--ps-muted)', fontFamily: 'var(--ps-font-sans)', marginBottom: '0.75rem' }}>
            {company} · {inputs.companyType} · {inputs.role} · {inputs.specialisation} · Archetype {archetype}
          </div>
        </div>
      )}

      {/* Section divider */}
      {(sections.agent1 || sections.agent7) && (
        <Verdict
          agent1Text={sections.agent1}
          agent7Text={sections.agent7}
          agent8Text={sections.agent8}
          inputs={inputs}
          parsed={parsed}
          isStreaming={isStreaming}
        />
      )}

      {sections.agent1 && <Divider />}

      {sections.agent2 && (
        <ArchetypeAnalysis
          text={sections.agent2}
          archetype={archetype}
          sectionTitle={archetypeTitle}
          isStreaming={isStreaming && !sections.agent3}
        />
      )}

      {sections.agent2 && sections.agent3 && <Divider />}

      {sections.agent3 && (
        <SignalPower
          text={sections.agent3}
          company={company}
          parsed={parsed}
          isStreaming={isStreaming && !sections.agent4}
        />
      )}

      {sections.agent3 && sections.agent4 && <Divider />}

      {sections.agent4 && (
        <TrustReach
          text={sections.agent4}
          company={company}
          parsed={parsed}
          isStreaming={isStreaming && !sections.agent5}
        />
      )}

      {sections.agent4 && sections.agent5 && <Divider />}

      {sections.agent5 && (
        <ShapeAgency
          text={sections.agent5}
          company={company}
          parsed={parsed}
          isStreaming={isStreaming && !sections.agent6}
        />
      )}

      {sections.agent5 && sections.agent6 && <Divider />}

      {sections.agent6 && (
        <CategoryPrecedents
          text={sections.agent6}
          isStreaming={isStreaming && !sections.agent7}
        />
      )}

      {sections.agent6 && sections.agent7 && <Divider />}

      {sections.agent7 && (
        <CascadeDiagnosis
          text={sections.agent7}
          parsed={parsed}
          isStreaming={isStreaming && !sections.agent8}
        />
      )}

      {sections.agent7 && sections.agent8 && <Divider />}

      {sections.agent8 && (
        <>
          <Mandate text={sections.agent8} isStreaming={false} />
          <Divider />
          <StakeholderForceField text={sections.agent8} isStreaming={false} />
          <Divider />
          <VocabularyKit text={sections.agent8} isStreaming={false} />
          <Divider />
          <UnaskedQuestion text={sections.agent8} isStreaming={false} />
          <Divider />
          <ContrarianView text={sections.agent8} isStreaming={false} />
        </>
      )}

    </div>
  )
}

function Divider() {
  return <div style={{ height: '0.5px', background: 'var(--ps-border)', margin: '2rem 0' }} />
}

const btnPrimary = {
  background: 'var(--ps-text)', color: 'var(--ps-surface)',
  border: 'none', borderRadius: '8px',
  padding: '0.625rem 1.25rem', fontSize: '13px',
  fontWeight: '500', cursor: 'pointer',
  fontFamily: 'var(--ps-font-sans)', flex: 1
}

const btnSecondary = {
  background: 'transparent', color: 'var(--ps-text)',
  border: '0.5px solid var(--ps-border-strong)',
  borderRadius: '8px', padding: '0.625rem 1.25rem',
  fontSize: '13px', cursor: 'pointer',
  fontFamily: 'var(--ps-font-sans)', flex: 1
}
