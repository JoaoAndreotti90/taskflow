import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Plus, Trash } from 'phosphor-react'
import { supabase } from '../../supabase'
import { Stats } from '../Stats/Stats'
import './Board.css'

export function Board({ onStatusChange }) {
  const projectId = localStorage.getItem('activeProjectId')

  const [columns, setColumns] = useState({
    todo: { id: 'todo', title: 'A Fazer', items: [] },
    doing: { id: 'doing', title: 'Fazendo', items: [] },
    paused: { id: 'paused', title: 'Pausado', items: [] },
    done: { id: 'done', title: 'Concluído', items: [] }
  })
  
  const [rawTasks, setRawTasks] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [userInitials, setUserInitials] = useState('...')

  useEffect(() => {
    getUserInitials()
    if (projectId) fetchTasks()
  }, [projectId])

  async function getUserInitials() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.user_metadata) {
      const firstName = user.user_metadata.first_name || ''
      const lastName = user.user_metadata.last_name || ''
      const initials = ((firstName[0] || '') + (lastName[0] || '')).toUpperCase()
      setUserInitials(initials || 'EU')
    }
  }

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('id', { ascending: true })

    if (!error) {
      setRawTasks(data)
      const newColumns = {
        todo: { id: 'todo', title: 'A Fazer', items: [] },
        doing: { id: 'doing', title: 'Fazendo', items: [] },
        paused: { id: 'paused', title: 'Pausado', items: [] },
        done: { id: 'done', title: 'Concluído', items: [] }
      }

      data.forEach(task => {
        if (newColumns[task.status]) {
          newColumns[task.status].items.push({
            id: task.id.toString(),
            content: task.title,
            tag: task.tag || 'Geral',
            tagClass: task.tag_class || 'default'
          })
        }
      })
      setColumns(newColumns)
    }
  }

  async function checkProjectCompletion(tasksList) {
    if (tasksList.length === 0) return

    const hasTodo = tasksList.some(t => t.status === 'todo')
    const hasDoing = tasksList.some(t => t.status === 'doing')
    const hasPaused = tasksList.some(t => t.status === 'paused')
    const hasDone = tasksList.some(t => t.status === 'done')

    let newStatus = 'pending'

    if (hasDoing) {
      newStatus = 'active'
    } else if (hasPaused) {
      newStatus = 'paused'
    } else if (hasTodo) {
      newStatus = 'pending'
    } else if (hasDone) {
      newStatus = 'finished'
    }

    await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId)

    if (onStatusChange) {
      onStatusChange(newStatus)
    }
  }

  async function updateTaskStatus(taskId, newStatus) {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    
    const updatedTasks = rawTasks.map(t => 
      t.id.toString() === taskId ? { ...t, status: newStatus } : t
    )
    setRawTasks(updatedTasks)
    checkProjectCompletion(updatedTasks)
  }

  async function confirmAddTask(e) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const { error } = await supabase
      .from('tasks')
      .insert([{ 
        title: newTaskTitle, 
        status: 'todo', 
        tag: 'Geral', 
        tag_class: 'design', 
        project_id: projectId 
      }])
    
    if (!error) {
      if (onStatusChange) onStatusChange('pending')
      
      fetchTasks()
      setIsAddModalOpen(false)
      setNewTaskTitle('')
    }
  }

  function openDeleteModal(taskId) { setTaskToDelete(taskId) }

  async function confirmDeleteTask() {
    if (!taskToDelete) return
    const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete)
    
    if (!error) {
      const updatedTasks = rawTasks.filter(t => t.id.toString() !== taskToDelete)
      setRawTasks(updatedTasks)
      checkProjectCompletion(updatedTasks)
      
      fetchTasks()
      setTaskToDelete(null)
    }
  }

  function openAddModal() {
    setIsAddModalOpen(true)
    setNewTaskTitle('')
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId]
      const destColumn = columns[destination.droppableId]
      const sourceItems = [...sourceColumn.items]
      const destItems = [...destColumn.items]
      const [removed] = sourceItems.splice(source.index, 1)
      destItems.splice(destination.index, 0, removed)

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems }
      })

      updateTaskStatus(draggableId, destination.droppableId)
    } else {
      const column = columns[source.droppableId]
      const copiedItems = [...column.items]
      const [removed] = copiedItems.splice(source.index, 1)
      copiedItems.splice(destination.index, 0, removed)
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      })
    }
  }

  return (
    <div className="board-wrapper">
      <Stats tasks={rawTasks} />

      <div className="board-container">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([columnId, column]) => (
            <div className="board-column" key={columnId}>
              <header className="column-header">
                <h3>{column.title}</h3>
                <div className="header-actions">
                  <span className="task-count">{column.items.length}</span>
                  {columnId === 'todo' && (
                    <button className="btn-icon-add" onClick={openAddModal}>
                      <Plus size={20} weight="bold" />
                    </button>
                  )}
                </div>
              </header>

              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div className="task-list" ref={provided.innerRef} {...provided.droppableProps}>
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div className="task-card" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <div className="card-tags">
                              <span className={`tag ${item.tagClass}`}>{item.tag || 'Geral'}</span>
                              <button className="btn-icon-delete" onClick={() => openDeleteModal(item.id)}>
                                <Trash size={16} />
                              </button>
                            </div>
                            <p className="card-title">{item.content}</p>
                            <div className="card-footer">
                              <div className="card-avatar">{userInitials}</div>
                              <span className="card-date">#ID {item.id}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Nova Tarefa</h2>
            <form onSubmit={confirmAddTask}>
              <input autoFocus type="text" className="modal-input" placeholder="Nome da tarefa" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Excluir Tarefa?</h2>
            <p className="modal-description">Tem certeza?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setTaskToDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDeleteTask}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}