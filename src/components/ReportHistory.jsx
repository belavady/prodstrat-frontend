import React, { useEffect, useState } from 'react'

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function ageLabel(days) {
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 14) return `${Math.floor(days / 7)} week ago`
  return `${Math.floor(days / 7)} weeks ago`
}

function ageColor(days) {
  if (days <= 7) return { bg: '#E1F5EE', color: '#085041', border: '#5DCAA5' }
  if (days <= 14) return { bg: '#FDF3E7', color: '#633806', border: '#E8C87A' }
  return { bg: '#FCEBEB', color: '#501313', border: '#F09595' }
}

export default function ReportHistory({ onLoad, onNewReport }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/reports`)
      .then(r => r.json())
      .then(data => {
        setReports(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (reports.length === 0) return null

  return (
    <div style={{ width: '100%', maxWidth: '600px', marginBottom: '2rem' }}>
      <div style={{
        fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase',
        color: 'var(--ps-muted)', marginBottom: '0.75rem',
        fontFamily: 'var(--ps-font-sans)'
      }}>
        Recent Reports
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {reports.slice(0, 8).map(r => {
          const days = daysSince(r.created_at)
          const age = ageColor(days)
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--ps-surface)',
              border: '0.5px solid var(--ps-border)',
              borderRadius: '8px', padding: '0.75rem 1rem',
              gap: '0.75rem'
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px', fontWeight: '500', color: 'var(--ps-text)',
                  fontFamily: 'var(--ps-font-sans)', marginBottom: '2px'
                }}>
                  {r.company}
                </div>
                <div style={{
                  fontSize: '11px', color: 'var(--ps-muted)',
                  fontFamily: 'var(--ps-font-sans)'
                }}>
                  {r.role} · {r.specialisation} · Archetype {r.archetype}
                </div>
              </div>
              <div style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '20px',
                background: age.bg, color: age.color, border: `0.5px solid ${age.border}`,
                whiteSpace: 'nowrap', fontFamily: 'var(--ps-font-sans)'
              }}>
                {ageLabel(days)}
              </div>
              <button
                onClick={() => onLoad(r.id)}
                style={{
                  fontSize: '12px', padding: '4px 10px',
                  background: 'transparent',
                  border: '0.5px solid var(--ps-border-strong)',
                  borderRadius: '6px', cursor: 'pointer',
                  color: 'var(--ps-text)', fontFamily: 'var(--ps-font-sans)'
                }}
              >
                View
              </button>
              <button
                onClick={() => window.open(`${API}/api/reports/${r.id}/download`, '_blank')}
                style={{
                  fontSize: '12px', padding: '4px 10px',
                  background: '#1A1A1A',
                  border: 'none',
                  borderRadius: '6px', cursor: 'pointer',
                  color: '#FFFFFF', fontFamily: 'var(--ps-font-sans)'
                }}
              >
                HTML
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
