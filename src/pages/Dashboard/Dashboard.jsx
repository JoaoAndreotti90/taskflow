import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'phosphor-react'
import { supabase } from '../../supabase'
import { Board } from '../../components/Board/Board'
import './Dashboard.css'

export function Dashboard() {
  const navigate = useNavigate()
  
  const [projectName, setProjectName] = useState('Carregando...')
  const [projectStatus, setProjectStatus] = useState('pending')
  const [isValidProject, setIsValidProject] = useState(false)

  useEffect(() => {
    validateProject()
  }, [])

  async function validateProject() {
    const projectId = localStorage.getItem('activeProjectId')

    if (!projectId) {
      navigate('/projects')
      return
    }

    const { data, error } = await supabase
      .from('projects')
      .select('name, status')
      .eq('id', projectId)
      .single()

    if (error || !data) {
      localStorage.removeItem('activeProjectId')
      localStorage.removeItem('activeProjectName')
      navigate('/projects')
    } else {
      setProjectName(data.name)
      setProjectStatus(data.status)
      setIsValidProject(true)
    }
  }

  function handleStatusChange(newStatus) {
    setProjectStatus(newStatus)
  }

  const statusLabel = {
    pending: 'Pendente',
    active: 'Em Andamento',
    paused: 'Pausado',
    finished: 'Concluído'
  }

  if (!isValidProject) {
    return <div className="loading-container">Verificando projeto...</div>
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        
        <div className="header-left">
          <Link to="/projects" className="btn-back" title="Voltar para Projetos">
            <ArrowLeft size={24} weight="bold" />
          </Link>
          
          <div className="project-info">
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <h2 className="project-title-large">{projectName}</h2>
              <span className={`status-badge ${projectStatus}`}>
                {statusLabel[projectStatus]}
              </span>
            </div>
          </div>
        </div>

      </header>
      
      <Board onStatusChange={handleStatusChange} />
    </div>
  )
}