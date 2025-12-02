import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash, Plus, FolderPlus } from 'phosphor-react'
import { supabase } from '../../supabase'
import { ProjectStats } from '../../components/Stats/ProjectStats'
import './Projects.css'

export function Projects() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newStatus, setNewStatus] = useState('active')

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function handleEnterProject(project) {
    localStorage.setItem('activeProjectId', project.id)
    localStorage.setItem('activeProjectName', project.name)
    navigate('/dashboard')
  }

  async function handleCreateProject(e) {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      const { error } = await supabase
        .from('projects')
        .insert([{ name: newName, description: newDesc, status: newStatus }])

      if (error) throw error
      
      setNewName('')
      setNewDesc('')
      setIsAddModalOpen(false)
      fetchProjects()
    } catch (error) {
      alert('Erro ao criar projeto.')
    }
  }

  async function handleDeleteProject() {
    if (!projectToDelete) return
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete)

      if (error) throw error
      setProjectToDelete(null)
      fetchProjects()
    } catch (error) {
      alert('Erro ao deletar projeto.')
    }
  }

  const statusMap = {
    active: 'Em Andamento',
    paused: 'Pausado',
    finished: 'Concluído'
  }

  return (
    <div className="page-container">
      {loading ? (
        <p>Carregando projetos...</p>
      ) : projects.length === 0 ? (
        <div className="empty-state-container">
          <FolderPlus size={64} weight="thin" className="empty-icon" />
          <h2>Você ainda não tem projetos</h2>
          <p>Crie seu primeiro projeto para começar a organizar suas tarefas.</p>
          <button className="btn-new-project-large" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={24} weight="bold" />
            Criar Meu Primeiro Projeto
          </button>
        </div>
      ) : (
        <>
          <header className="page-header">
            <h2 className="page-title">Selecionar Projeto</h2>
            <button className="btn-new-project" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={20} weight="bold" className="btn-icon" />
              Novo Projeto
            </button>
          </header>
          
          <ProjectStats projects={projects} />

          <div className="projects-grid">
            {projects.map(project => (
              <div className="project-card" key={project.id} onClick={() => handleEnterProject(project)}>
                <div className="card-header">
                  <h3 className="project-name">{project.name}</h3>
                  <button className="btn-delete-project" onClick={(e) => { e.stopPropagation(); setProjectToDelete(project.id) }} title="Excluir projeto">
                    <Trash size={18} />
                  </button>
                </div>
                <p className="project-desc">{project.description || 'Sem descrição'}</p>
                <span className={`status ${project.status}`}>{statusMap[project.status]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Novo Projeto</h2>
            <form onSubmit={handleCreateProject}>
              <input autoFocus type="text" className="modal-input" placeholder="Nome do Projeto" value={newName} onChange={e => setNewName(e.target.value)} required />
              <input type="text" className="modal-input" placeholder="Descrição curta" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <select className="modal-select" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="pending">Pendente</option>
                <option value="active">Em Andamento</option>
                <option value="paused">Pausado</option>
                <option value="finished">Concluído</option>
              </select>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Excluir Projeto?</h2>
            <p className="modal-description">Essa ação apagará todas as tarefas dele.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setProjectToDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeleteProject}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}