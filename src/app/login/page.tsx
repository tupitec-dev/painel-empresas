'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagemReset, setMensagemReset] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setMensagemReset('')
    setCarregando(true)

    const { data: auth, error: erroAuth } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (erroAuth || !auth.user) {
      setErro('Credenciais inválidas.')
      setCarregando(false)
      return
    }

    const { data: usuario, error: erroUsuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (erroUsuario || !usuario) {
      setErro('Usuário não encontrado em nossa base de dados.')
      setCarregando(false)
      return
    }

    if (usuario.precisa_trocar_senha === true) {
      router.push('/atualizar-senha')
      return
    }

    if (usuario.perfil === 'admin_empresa') {
      router.push('/empresa')
    } else if (usuario.perfil === 'tupitec_master' || usuario.perfil === 'tupitec_staff') {
      router.push('/dashboard')
    } else {
      setErro('Perfil de usuário inválido.')
    }

    setCarregando(false)
  }

  const handleResetSenha = async () => {
    setErro('')
    setMensagemReset('')

    if (!email) {
      setErro('Informe o e-mail para redefinir a senha.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://painel.tupitec.dev/nova-senha',
    })

    if (error) {
      setErro('Erro ao enviar link de redefinição. Verifique o e-mail informado.')
    } else {
      setMensagemReset('Um link foi enviado para seu e-mail para redefinir a senha.')
    }
  }


  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.form}>
        <h1 className={styles.titulo}>Painel de Acesso</h1>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={styles.input}
          required
        />

        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={handleResetSenha}
            className={styles.link}
            style={{ background: 'none', border: 'none', color: '#0070f3', cursor: 'pointer' }}
          >
            Esqueci minha senha
          </button>
        </div>

        {erro && <div className={styles.erro}>{erro}</div>}
        {mensagemReset && <div className={styles.sucesso}>{mensagemReset}</div>}

        <button type="submit" className={styles.botao} disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
