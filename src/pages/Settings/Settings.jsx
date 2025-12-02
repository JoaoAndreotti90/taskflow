import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import './Settings.css'

export function Settings() {
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  
  const fullName = `${firstName || ''} ${lastName || ''}`.trim()
  
  const getInitials = () => {
    if (!fullName) return 'EU'
    const parts = fullName.split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  useEffect(() => {
    getUserData()
  }, [])

  async function getUserData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setEmail(user.email)
      setFirstName(user.user_metadata.first_name || '')
      setLastName(user.user_metadata.last_name || '')
      setAvatarUrl(user.user_metadata.avatar_url || null)
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)
    setSuccessMsg('') 
    setErrorMsg('')
  }

  function handleRemovePhoto() {
    setPreviewUrl(null)
    setAvatarUrl(null) 
    setSelectedFile(null)
  }

  async function handleSaveProfile() {
    try {
      setLoading(true)
      setSuccessMsg('')
      setErrorMsg('')

      let finalAvatarUrl = avatarUrl

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        
        finalAvatarUrl = publicUrl
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: finalAvatarUrl 
        }
      })

      if (updateError) throw updateError

      setAvatarUrl(finalAvatarUrl)
      setPreviewUrl(null)
      setSelectedFile(null)
      
      setSuccessMsg('Perfil salvo com sucesso!')
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error(error)
      setErrorMsg('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const displayImage = previewUrl || avatarUrl

  return (
    <div className="settings-container">
      <h2 className="settings-title">Configurar Perfil</h2>
      
      <div className="settings-card">
        
        <div className="avatar-upload-section">
          <div className="current-avatar">
            {displayImage ? (
              <img src={displayImage} alt="Avatar" />
            ) : (
              <span>{getInitials()}</span>
            )}
          </div>
          
          <div className="avatar-actions">
            <label className="upload-label">
              Alterar foto de perfil
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect}
                className="hidden-input"
              />
            </label>

            {displayImage && (
              <button 
                type="button" 
                className="btn-remove-photo"
                onClick={handleRemovePhoto}
              >
                Remover foto
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email (Não editável)</label>
          <input type="text" className="form-input" value={email} disabled />
        </div>

        <div className="form-group">
          <label className="form-label">Nome</label>
          <input 
            type="text" 
            className="form-input" 
            value={firstName} 
            onChange={e => setFirstName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Sobrenome</label>
          <input 
            type="text" 
            className="form-input" 
            value={lastName} 
            onChange={e => setLastName(e.target.value)}
          />
        </div>

        {successMsg && <div className="status-message status-success">{successMsg}</div>}
        {errorMsg && <div className="status-message status-error">{errorMsg}</div>}

        <button className="btn-save" onClick={handleSaveProfile} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>

      </div>
    </div>
  )
}