import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AGENT_LABELS, ARCHETYPE_SECTION_TITLES } from '../utils/archetypeConfig'

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

const AGENT_SEQUENCE = [
  'agent1','agent2','agent3','agent4',
  'agent5','agent6','agent7','agent8'
]

export default function ReportStream({ inputs, onReset, onForceRerun }) {
  const [currentAgent, setCurrentAgent] = useState(null)
  const [completedAgents, setCompletedAgents] = useState([])
  const [connectionState, setConnectionState] = useState('connecting')
  const [reportId, setReportId] = useState(null)
  const [cacheWarning, setCacheWarning] = useState(null)
  const [progress, setProgress] = useState(0)
  const controllerRef = useRef(null)
  const totalAgents = 9

  const loadCachedReport = useCallback((data) => {
    if (data?.id) setReportId(data.id)
    setProgress(100)
    setConnectionState('complete')
  }, [])

  useEffect(() => {
    if (inputs._preloaded) {
      loadCachedReport(inputs._preloaded)
      return
    }

    const controller = new AbortController()
    controllerRef.current = controller

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

            if (event.type === 'done') {
              setCompletedAgents(prev => [...prev, event.section])
              setProgress(prev => Math.min(97, prev + Math.floor(97 / totalAgents)))
            }

            if (event.type === 'complete') {
              if (event.reportId) setReportId(event.reportId)
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
  }, [inputs, loadCachedReport])

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

  const [linkCopied, setLinkCopied] = useState(false)

  const shareableLink = reportId
    ? `${API}/api/reports/${reportId}/view`
    : null

  const handleCopyLink = () => {
    if (!shareableLink) return
    navigator.clipboard.writeText(shareableLink).then(() => {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    })
  }

  const handleOpenReport = () => {
    if (!shareableLink) return
    window.open(shareableLink, '_blank')
  }

  const handleSavePDF = () => {
    if (!shareableLink) return
    const win = window.open(shareableLink, '_blank')
    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => win.print(), 800)
      })
    }
  }

  const agentLabel = currentAgent
    ? (AGENT_LABELS[currentAgent] || 'Processing...')
    : connectionState === 'connecting' ? 'Connecting to server...'
    : connectionState === 'complete' ? 'Complete'
    : 'Processing...'

  return (
    <div style={{
      width: '100%', maxWidth: '520px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '2rem'
    }}>

      {/* Cache warning modal */}
      {cacheWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--ps-surface)', borderRadius: '14px',
            padding: '2rem', maxWidth: '400px', width: '90%',
            border: '0.5px solid var(--ps-border-strong)'
          }}>
            <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: cacheWarning.cacheStatus === 'stale' ? '#A32D2D' : '#8B5A1A', marginBottom: '0.5rem', fontFamily: 'var(--ps-font-sans)' }}>
              {cacheWarning.cacheStatus === 'stale' ? 'Report may be outdated' : 'Cached report available'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--ps-text)', marginBottom: '0.75rem', fontFamily: 'var(--ps-font-sans)' }}>
              This report is {cacheWarning.ageDays} days old.
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ps-muted)', marginBottom: '1.5rem', fontFamily: 'var(--ps-font-sans)', lineHeight: '1.6' }}>
              {cacheWarning.cacheStatus === 'stale'
                ? 'Significant developments may have occurred. Consider re-running for current intelligence.'
                : 'AI markets move fast. The cached analysis may still be accurate or conditions may have shifted.'}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleCacheView} style={btnSecondary}>View Cached</button>
              <button onClick={handleCacheRerun} style={btnPrimary}>Re-run Fresh</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: '500', letterSpacing: '-0.5px', fontFamily: 'var(--ps-font-sans)', color: 'var(--ps-text)', marginBottom: '0.4rem' }}>
          Prod<span style={{ color: 'var(--ps-signal)' }}>Strat</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--ps-muted)', fontFamily: 'var(--ps-font-sans)' }}>
          {inputs.company} · {inputs.role} · {inputs.specialisation}
        </div>
      </div>

      {/* Progress section */}
      {connectionState !== 'complete' && (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '13px', color: 'var(--ps-muted)', fontFamily: 'var(--ps-font-sans)' }}>
              {agentLabel}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ps-hint)', fontFamily: 'var(--ps-font-sans)' }}>
              {progress}%
            </div>
          </div>
          <div style={{ height: '3px', background: 'var(--ps-surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--ps-text)',
              borderRadius: '2px',
              transition: 'width 0.6s ease'
            }} />
          </div>

          {/* Agent checklist */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {AGENT_SEQUENCE.map(agentId => {
              const isDone = completedAgents.includes(agentId) ||
                completedAgents.some(a => a.startsWith('agent2') && agentId === 'agent2')
              const isCurrent = currentAgent === agentId ||
                (currentAgent?.startsWith('agent2') && agentId === 'agent2')
              const label = AGENT_LABELS[agentId] || AGENT_LABELS[agentId + inputs.archetype.toLowerCase()] || 'Processing...'
              return (
                <div key={agentId} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  opacity: !isDone && !isCurrent ? 0.35 : 1,
                  transition: 'opacity 0.3s'
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: isDone ? '#1D9E75' : isCurrent ? '#B87333' : '#D3D1C7',
                    transition: 'background 0.3s'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: isCurrent ? 'var(--ps-text)' : 'var(--ps-muted)',
                    fontFamily: 'var(--ps-font-sans)',
                    transition: 'color 0.3s'
                  }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Error state */}
      {connectionState === 'error' && (
        <div style={{
          background: '#FCEBEB', border: '0.5px solid #F09595',
          borderRadius: '10px', padding: '1.25rem',
          width: '100%'
        }}>
          <div style={{ fontSize: '13px', color: '#501313', marginBottom: '0.75rem', fontFamily: 'var(--ps-font-sans)' }}>
            Connection lost{completedAgents.length > 0 ? ` after ${completedAgents.length} agents` : ''}. Try again.
          </div>
          <button onClick={onReset} style={btnSecondary}>Start Over</button>
        </div>
      )}

      {/* Complete — shareable link */}
      {connectionState === 'complete' && (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#E1F5EE', border: '1px solid #5DCAA5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 11L9 15L17 7" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--ps-text)', marginBottom: '0.4rem', fontFamily: 'var(--ps-font-sans)' }}>
            Report Ready
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ps-muted)', marginBottom: '2rem', fontFamily: 'var(--ps-font-sans)' }}>
            {inputs.company} · {inputs.specialisation}
          </div>

          {/* Shareable link box */}
          {shareableLink && (
            <div style={{
              background: '#FFFFFF', border: '0.5px solid var(--ps-border-strong)',
              borderRadius: '10px', padding: '1rem 1.25rem',
              marginBottom: '1rem', textAlign: 'left'
            }}>
              <div style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ps-muted)', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                Shareable Link
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ps-muted)', wordBreak: 'break-all', marginBottom: '0.75rem', fontFamily: 'monospace', lineHeight: '1.5' }}>
                {shareableLink}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleCopyLink} style={{ ...btnPrimary, flex: 1, fontSize: '12px' }}>
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
                <button onClick={handleOpenReport} style={{ ...btnSecondary, flex: 1, fontSize: '12px' }}>
                  Open Report
                </button>
                <button onClick={handleSavePDF} style={{ ...btnSecondary, flex: 1, fontSize: '12px' }}>
                  Save PDF
                </button>
              </div>
            </div>
          )}

          <button onClick={onReset} style={{ ...btnGhost, marginTop: '0.5rem' }}>
            Run Another Report
          </button>
        </div>
      )}
    </div>
  )
}

const btnPrimary = {
  background: '#1A1A1A', color: '#FFFFFF',
  border: 'none', borderRadius: '8px',
  padding: '0.75rem 1.5rem', fontSize: '13px',
  fontWeight: '500', cursor: 'pointer',
  fontFamily: 'var(--ps-font-sans)'
}

const btnSecondary = {
  background: 'transparent', color: '#1A1A1A',
  border: '0.5px solid rgba(0,0,0,0.2)',
  borderRadius: '8px', padding: '0.75rem 1.5rem',
  fontSize: '13px', cursor: 'pointer',
  fontFamily: 'var(--ps-font-sans)'
}

const btnGhost = {
  background: 'transparent', color: 'var(--ps-muted)',
  border: 'none', padding: '0.5rem 1rem',
  fontSize: '12px', cursor: 'pointer',
  fontFamily: 'var(--ps-font-sans)',
  display: 'block', margin: '0 auto'
}
