import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api'
import { useSettings } from '../contexts/SettingsContext'

function getSession() {
  try { return JSON.parse(sessionStorage.getItem('tenant_session') || 'null') } catch { return null }
}

export default function Sidebar() {
  const [recoveryAgent, setRecoveryAgent] = useState('Select Agent')
  const [messagingAgent, setMessagingAgent] = useState('Select Agent')
  const [agents, setAgents] = useState([])
  const { settings, updateSettings } = useSettings()
  const session = getSession()
  const navigate = useNavigate()

  const logout = async () => {
    try {
      const session = getSession()
      if (session?.tenantId) {
        await api.logout({ tenantId: session.tenantId })
      }
    } catch {
      // don't block logout if the API call fails
    } finally {
      sessionStorage.removeItem('tenant_session')
      navigate('/login')
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const agentData = await api.listAgents()
        setAgents(Array.isArray(agentData) ? agentData : [])
        if (settings) {
          setRecoveryAgent(settings.recoveryAgent || 'Select Agent')
          setMessagingAgent(settings.messagingAgent || 'Select Agent')
        }
      } catch {}
    }
    load()
  }, [settings])

  // Updates are handled by SettingsContext.updateSettings

  const recoveryAgents = agents.filter(agent => {
    const category = String(agent.category || '').toLowerCase()
    return category === 'cancel' || category === 'cancle'
  })

  const messagingAgents = agents.filter(agent => {
    const category = String(agent.category || '').toLowerCase()
    return category === 'delay'
  })

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        {session?.companyName || 'Admin Dashboard'}
        <div className="sidebar-tenant">ID: {session?.tenantId || '—'}</div>
      </div>

      <div className="agent-section">
        <div className="agent-label">Recovery Agent</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="agent-dot green" style={{ position: 'absolute', left: 10, zIndex: 1 }} />
          <select
            className="agent-select"
            style={{ paddingLeft: 26 }}
            value={recoveryAgent}
            onChange={e => {
              const nextValue = e.target.value
              setRecoveryAgent(nextValue)
              updateSettings(nextValue, messagingAgent).catch(()=>{})
            }}
          >
            <option value="Select Agent">Select Agent</option>
            {recoveryAgents.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
          </select>
        </div>
      </div>

      <div className="agent-section">
        <div className="agent-label">Messaging Agent</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span className="agent-dot blue" style={{ position: 'absolute', left: 10, zIndex: 1 }} />
          <select
            className="agent-select"
            style={{ paddingLeft: 26 }}
            value={messagingAgent}
            onChange={e => {
              const nextValue = e.target.value
              setMessagingAgent(nextValue)
              updateSettings(recoveryAgent, nextValue).catch(()=>{})
            }}
          >
            <option value="Select Agent">Select Agent</option>
            {messagingAgents.map(a => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
          </select>
        </div>
      </div>
      <nav style={{ marginTop: 8 }}>
       <ul className="nav-list">

  <li className="nav-item">
    <NavLink to="/app" end className={({ isActive }) => isActive ? 'active' : ''}>
      <span className="nav-icon">☰</span> Dashboard
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink to="/app/brand-guidelines" className={({ isActive }) => isActive ? 'active' : ''}>
      <span className="nav-icon">📋</span> Brand Guidelines
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink to="/app/prompt-override" className={({ isActive }) => isActive ? 'active' : ''}>
      <span className="nav-icon">✎</span> Prompt Override
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink to="/app/message-template" className={({ isActive }) => isActive ? 'active' : ''}>
      <span className="nav-icon">✉</span> Message Template
    </NavLink>
  </li>

  <li className="nav-item">
    <NavLink to="/app/api-settings" className={({ isActive }) => isActive ? 'active' : ''}>
      <span className="nav-icon">⚙</span> URLs & API Keys
    </NavLink>
  </li>

</ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-email">{session?.email}</div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  )
}
