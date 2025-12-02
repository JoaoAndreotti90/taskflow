import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'phosphor-react'
import { supabase } from '../../supabase'
import { Board } from '../../components/Board/Board'
import './Dashboard.css'

export function Dashboard() {
  const navigate = useNavigate()
  const [userInitials, setUserInitials] = useState('...')
  const [userAvatarUrl, setUserAvatarUrl] = useState(null)
  
  const [projectName, setProjectName] = useState('Carregando...')
  const [isValidProject, setIsValidProject] = useState(false)

  useEffect(() => {
    validateProject()
    getUserProfile()
  }, [])

  async function validateProject() {
    const projectId = localStorage.getItem('activeProjectId')

    if (!projectId) {
      navigate('/projects')
      return
    }

    const { data, error } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single()

    if (error || !data) {
      localStorage.removeItem('activeProjectId')
      localStorage.removeItem('activeProjectName')
      navigate('/projects')
    } else {
      setProjectName(data.name)
      setIsValidProject(true)
    }
  }

  async function getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.user_metadata) {
      const firstName = user.user_metadata.first_name || ''
      const lastName = user.user_metadata.last_name || ''
      setUserInitials(((firstName[0] || '') + (lastName[0] || '')).toUpperCase())
      if (user.user_metadata.avatar_url) setUserAvatarUrl(user.user_metadata.avatar_url)
    }
  }

  if (!isValidProject) {
    return <div className="loading-container">Verificando projeto...</div>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        
        <div className="header-left">
          <Link to="/projects" className="btn-back" title="Trocar de Projeto">
            <ArrowLeft size={24} weight="bold" />
          </Link>
          <div className="project-info">
            <span className="project-subtitle">Dashboard do Projeto</span>
            <h2 className="project-title-large">{projectName}</h2>
          </div>
        </div>
        
      </header>
      
      <Board />
    </div>
  )
}