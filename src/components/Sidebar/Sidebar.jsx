import { useEffect, useState } from 'react'
import { Kanban, SquaresFour, User, Gear, SignOut, X } from 'phosphor-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabase'
import './Sidebar.css'

export function Sidebar() {
  const navigate = useNavigate()
  const [userInitials, setUserInitials] = useState('...')
  const [userAvatarUrl, setUserAvatarUrl] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  useEffect(() => {
    getUserProfile()
  }, [])

  async function getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.user_metadata) {
      const firstName = user.user_metadata.first_name || ''
      const lastName = user.user_metadata.last_name || ''
      setUserInitials(((firstName[0] || '') + (lastName[0] || '')).toUpperCase())
      if (user.user_metadata.avatar_url) setUserAvatarUrl(user.user_metadata.avatar_url)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    localStorage.clear()
    navigate('/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo-container">
        <Kanban size={32} weight="fill" className="logo-icon" />
        TaskFlow
      </div>
      
      <nav className="nav-links">
        <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Kanban size={24} />
          Projetos
        </NavLink>
        
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <SquaresFour size={24} />
          Dashboard
        </NavLink>
        
        <NavLink to="/team" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <User size={24} />
          Equipe
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Gear size={24} />
          Configurações
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="sidebar-avatar">
            {userAvatarUrl ? <img src={userAvatarUrl} alt="Perfil" /> : <span>{userInitials}</span>}
          </div>
          <div className="user-info">
            <span className="user-name">Minha Conta</span>
            <button onClick={() => setIsConfirmOpen(true)} className="btn-logout">
              <SignOut size={16} /> Sair
            </button>
          </div>
        </div>
      </div>
      
      {isConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setIsConfirmOpen(false)} className="modal-close-btn">
              <X size={20} />
            </button>
            <h2 className="modal-title">Confirmar Saída</h2>
            <p className="modal-text">Tem certeza que deseja encerrar sua sessão?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsConfirmOpen(false)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  )
}