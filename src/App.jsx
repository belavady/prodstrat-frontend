import React, { useState, useCallback } from 'react'
import './styles/global.css'
import InputForm from './components/InputForm'
import ReportStream from './components/ReportStream'
import ReportHistory from './components/ReportHistory'

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001'

export default function App() {
  const [view, setView] = useState('home')
  const [inputs, setInputs] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reportKey, setReportKey] = useState(0)

  const handleSubmit = useCallback((formData) => {
    setInputs({ ...formData, forceRerun: false })
    setIsLoading(true)
    setReportKey(k => k + 1)
    setView('report')
  }, [])

  const handleForceRerun = useCallback((currentInputs) => {
    const fresh = { ...currentInputs, forceRerun: true, _preloaded: undefined }
    setInputs(fresh)
    setReportKey(k => k + 1)
  }, [])

  const handleLoadHistory = useCallback(async (reportId) => {
    try {
      const res = await fetch(`${API}/api/reports/${reportId}`)
      const data = await res.json()
      if (data?.outputs) {
        setInputs({
          company: data.company,
          companyType: data.company_type,
          role: data.role,
          specialisation: data.specialisation,
          archetype: data.archetype,
          forceRerun: false,
          _preloaded: data
        })
        setReportKey(k => k + 1)
        setView('report')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Failed to load report:', err)
    }
  }, [])

  const handleReset = useCallback(() => {
    setView('home')
    setInputs(null)
    setIsLoading(false)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ps-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem'
    }}>
      {view === 'home' && (
        <>
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <div style={{
              fontSize: '28px', fontWeight: '500', letterSpacing: '-0.5px',
              fontFamily: 'var(--ps-font-sans)', color: 'var(--ps-text)',
              marginBottom: '0.5rem'
            }}>
              Prod<span style={{ color: 'var(--ps-signal)' }}>Strat</span>
            </div>
            <div style={{
              fontSize: '14px', color: 'var(--ps-muted)',
              fontFamily: 'var(--ps-font-sans)'
            }}>
              Strategic intelligence for senior PMs and PMMs at AI-first companies
            </div>
          </div>

          <ReportHistory onLoad={handleLoadHistory} />
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </>
      )}

      {view === 'report' && inputs && (
        <ReportStream
          key={reportKey}
          inputs={inputs}
          onReset={handleReset}
          onForceRerun={handleForceRerun}
        />
      )}
    </div>
  )
}
