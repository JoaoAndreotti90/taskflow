import { useEffect, useState } from 'react'
import { Plus, Trash, ShieldCheck } from 'phosphor-react'
import { supabase } from '../../supabase'
import './Team.css'

export function Team() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)

  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Developer')
  const [isNewAdmin, setIsNewAdmin] = useState(false)

  useEffect(() => {
    syncCurrentUser()
  }, [])

  async function syncCurrentUser() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const firstName = user.user_metadata.first_name || 'Eu'
      const lastName = user.user_metadata.last_name || ''
      const fullName = `${firstName} ${lastName}`.trim()
      const avatarUrl = user.user_metadata.avatar_url || null

      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (!existingMember) {
        await supabase.from('team_members').insert([{
          name: fullName,
          email: user.email,
          role: 'CEO / Founder',
          is_admin: true,
          avatar_url: avatarUrl
        }])
      } else {
        await supabase.from('team_members').update({
          name: fullName,
          avatar_url: avatarUrl
        }).eq('email', user.email)
      }
      fetchMembers()
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  async function fetchMembers() {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      setMembers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddMember(e) {
    e.preventDefault()
    if (!newEmail.trim()) return

    try {
      const { error } = await supabase
        .from('team_members')
        .insert([{ 
            name: newName || newEmail.split('@')[0], 
            email: newEmail,
            role: newRole,
            is_admin: isNewAdmin,
            avatar_url: null 
          }])

      if (error) throw error
      setNewName('')
      setNewEmail('')
      setNewRole('Developer')
      setIsNewAdmin(false)
      setIsAddModalOpen(false)
      fetchMembers()
    } catch (error) {
      alert('Erro ao adicionar membro.')
    }
  }

  async function handleDeleteMember() {
    if (!memberToDelete) return
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberToDelete)

      if (error) throw error
      setMemberToDelete(null)
      fetchMembers()
    } catch (error) {
      alert('Erro ao remover membro.')
    }
  }

  function getInitials(name) {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h2 className="page-title">Minha Equipe</h2>
        <button className="btn-add-member" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} weight="bold" />
          Adicionar Membro
        </button>
      </header>
      
      {loading ? (
        <p>Carregando equipe...</p>
      ) : (
        <div className="team-grid">
          {members.map(member => (
            <div className="team-card" key={member.id}>
              <div className="member-avatar">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} />
                ) : (
                  getInitials(member.name || member.email)
                )}
              </div>
              
              <div className="member-info">
                <h4 className="member-name">{member.name}</h4>
                <p className="member-email">{member.email}</p>
                <div className="badges-row">
                  <span className="badge badge-role">{member.role}</span>
                  {member.is_admin && (
                    <span className="badge badge-admin">
                      <ShieldCheck size={12} weight="fill" className="badge-icon" />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <button className="btn-remove-member" onClick={() => setMemberToDelete(member.id)} title="Remover da equipe">
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Novo Membro</h2>
            <form onSubmit={handleAddMember}>
              <input autoFocus type="email" className="modal-input" placeholder="Email do usuário" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
              <input type="text" className="modal-input" placeholder="Nome (Opcional)" value={newName} onChange={e => setNewName(e.target.value)} />
              <label className="modal-label">Cargo / Função</label>
              <select className="modal-select" value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="Developer">Desenvolvedor</option>
                <option value="Designer">UI/UX Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Marketing">Marketing</option>
                <option value="QA Tester">QA / Tester</option>
              </select>
              <label className="checkbox-wrapper">
                <input type="checkbox" checked={isNewAdmin} onChange={e => setIsNewAdmin(e.target.checked)} />
                <span>Acesso de Administrador</span>
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Remover Membro?</h2>
            <p className="modal-description">Essa pessoa perderá acesso ao projeto.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setMemberToDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeleteMember}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}