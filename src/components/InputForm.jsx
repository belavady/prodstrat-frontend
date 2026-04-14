import React, { useState, useEffect } from 'react'
import { ARCHETYPES, PM_SPECIALISATIONS, PMM_SPECIALISATIONS, COMPANY_TYPES } from '../utils/archetypeConfig'

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

export default function InputForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({
    company: '',
    companyType: 'SaaS',
    role: 'PM',
    specialisation: 'Consumer PM',
    archetype: 'A',
    liveContext: ''
  })
  const [serverReady, setServerReady] = useState(null)

  // Health check on mount — handles Render cold start
  useEffect(() => {
    fetch(`${API}/health`)
      .then(r => r.json())
      .then(() => setServerReady(true))
      .catch(() => setServerReady(false))
  }, [])

  const specialisations = form.role === 'PM' ? PM_SPECIALISATIONS : PMM_SPECIALISATIONS

  const set = (field) => (e) => {
    const val = e.target.value
    setForm(prev => {
      const next = { ...prev, [field]: val }
      // Reset specialisation when role changes
      if (field === 'role') {
        next.specialisation = val === 'PM'
          ? PM_SPECIALISATIONS[0].value
          : PMM_SPECIALISATIONS[0].value
      }
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company.trim()) return
    onSubmit(form)
  }

  const selectedArchetype = ARCHETYPES.find(a => a.value === form.archetype)

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>

      {/* Server status */}
      {serverReady === false && (
        <div style={{
          background: '#FDF3E7', border: '0.5px solid #E8C87A',
          borderRadius: '8px', padding: '0.75rem 1rem',
          fontSize: '13px', color: '#633806',
          marginBottom: '1.25rem', fontFamily: 'var(--ps-font-sans)'
        }}>
          Server warming up — first report may take 30s longer than usual.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Company name */}
        <div>
          <label style={labelStyle}>Company Name</label>
          <input
            type="text"
            value={form.company}
            onChange={set('company')}
            placeholder="e.g. Anthropic, SAP, Cursor"
            style={inputStyle}
            autoFocus
            required
          />
        </div>

        {/* Company type + Role row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={labelStyle}>Company Type</label>
            <select value={form.companyType} onChange={set('companyType')} style={selectStyle}>
              {COMPANY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <select value={form.role} onChange={set('role')} style={selectStyle}>
              <option value="PM">PM</option>
              <option value="PMM">PMM</option>
            </select>
          </div>
        </div>

        {/* Specialisation */}
        <div>
          <label style={labelStyle}>Specialisation</label>
          <select value={form.specialisation} onChange={set('specialisation')} style={selectStyle}>
            {specialisations.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* AI Archetype */}
        <div>
          <label style={labelStyle}>AI Archetype</label>
          <select value={form.archetype} onChange={set('archetype')} style={selectStyle}>
            {ARCHETYPES.map(a => (
              <option key={a.value} value={a.value}>
                {a.label} ({a.value})
              </option>
            ))}
          </select>
          {selectedArchetype && (
            <div style={{
              fontSize: '11px', color: 'var(--ps-muted)',
              marginTop: '0.35rem', fontFamily: 'var(--ps-font-sans)'
            }}>
              {selectedArchetype.description}
            </div>
          )}
        </div>

        {/* Live Intelligence Context */}
        <div>
          <label style={labelStyle}>
            Live Intelligence Context
            <span style={{ fontWeight: '400', marginLeft: '6px', color: 'var(--ps-hint, #B4AFA8)' }}>optional</span>
          </label>
          <textarea
            value={form.liveContext}
            onChange={set('liveContext')}
            placeholder={'Paste recent news, product moves, funding rounds, or competitive intelligence about this company.\n\nFor best results: ask Claude to research this company first, then paste the output here.'}
            rows={5}
            style={{
              ...inputStyle,
              resize: 'vertical',
              lineHeight: '1.55',
              fontSize: '13px',
              minHeight: '100px'
            }}
          />
          <div style={{ fontSize: '11px', color: 'var(--ps-muted)', marginTop: '0.35rem', fontFamily: 'var(--ps-font-sans)', lineHeight: '1.5' }}>
            Agents will treat this as verified current intelligence. Leave blank to rely on live web search only.
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !form.company.trim()}
          style={{
            background: isLoading ? 'var(--ps-surface-2)' : 'var(--ps-text)',
            color: isLoading ? 'var(--ps-muted)' : 'var(--ps-surface)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.875rem 1.5rem',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--ps-font-sans)',
            transition: 'all 0.15s ease',
            marginTop: '0.5rem'
          }}
        >
          {isLoading ? 'Generating...' : 'Generate ProdStrat Report'}
        </button>

      </div>
    </form>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '500',
  color: 'var(--ps-muted)',
  marginBottom: '0.35rem',
  fontFamily: 'var(--ps-font-sans)',
  letterSpacing: '0.3px'
}

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  fontSize: '14px',
  border: '0.5px solid var(--ps-border-strong)',
  borderRadius: '8px',
  background: 'var(--ps-surface)',
  color: 'var(--ps-text)',
  fontFamily: 'var(--ps-font-sans)',
  outline: 'none'
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B6B6B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '2rem'
}
