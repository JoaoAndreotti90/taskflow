import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Kanban } from 'phosphor-react'
import { supabase } from '../../supabase'
import './Login.css'

export function Login() {
  const navigate = useNavigate()
  
  const [isRegister, setIsRegister] = useState(false)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  function toggleMode() {
    setIsRegister(!isRegister)
    setErrorMsg('')
    setSuccessMsg('')
    setPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        })
        
        if (error) throw error
        
        setSuccessMsg('Conta criada! Agora faça login.')
        setIsRegister(false)

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        navigate('/projects')
      }

    } catch (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMsg('Email ou senha incorretos.')
      } else if (error.message.includes('User already registered')) {
        setErrorMsg('Este email já está cadastrado. Tente fazer login.')
      } else {
        setErrorMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        
        <div className="logo">
          <Kanban size={32} weight="fill" className="logo-icon" />
          TaskFlow
        </div>

        <p className="login-subtitle">
          {isRegister ? 'Crie sua conta gratuitamente' : 'Bem-vindo de volta!'}
        </p>
        
        {errorMsg && <div className="msg-box msg-error">{errorMsg}</div>}
        {successMsg && <div className="msg-box msg-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          
          {isRegister && (
            <div className="name-row">
              <div className="input-group">
                <label>Nome</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required={isRegister}
                />
              </div>
              <div className="input-group">
                <label>Sobrenome</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input 
              type="password" 
              placeholder="******"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Carregando...' : (isRegister ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <p className="toggle-text">
          {isRegister ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <span className="toggle-link" onClick={toggleMode}>
            {isRegister ? 'Fazer Login' : 'Criar agora'}
          </span>
        </p>
      </div>
    </div>
  )
}