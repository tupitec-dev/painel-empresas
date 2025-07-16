'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './AtualizarSenhaPage.module.css'

export default function AtualizarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function verificarSessao() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      }
    }
    verificarSessao()
  }, [router])

  const handleAtualizarSenha = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    const { data: { user }, error: erroAuth } = await supabase.auth.updateUser({
      password: novaSenha,
    })

    if (erroAuth) {
      setErro(`Erro ao atualizar a senha: ${erroAuth.message}`)
      setCarregando(false)
      return
    }

    const emailUsuario = user?.email ?? (await supabase.auth.getUser()).data.user?.email

    if (!emailUsuario) {
      setErro('Não foi possível obter o e-mail do usuário logado.')
      setCarregando(false)
      return
    }

    const { error: erroPerfil } = await supabase
      .from('usuarios')
      .update({ precisa_trocar_senha: false })
      .eq('email', emailUsuario)

    if (erroPerfil) {
      console.error('Erro ao atualizar campo precisa_trocar_senha:', erroPerfil)
      setErro('Sua senha foi atualizada, mas houve um erro ao atualizar seu perfil. Contate o suporte.')
      setCarregando(false)
      return
    }

    const { data: perfilUsuario, error: erroBuscaPerfil } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('email', emailUsuario)
      .limit(1)
      .single()

    if (erroBuscaPerfil) {
      setErro('Não foi possível verificar seu perfil para o redirecionamento.')
      setCarregando(false)
      return
    }

    setSucesso('Senha atualizada com sucesso! Você será redirecionado.')

    setTimeout(() => {
      if (perfilUsuario?.perfil === 'admin_empresa') {
        router.push('/empresa')
      } else {
        router.push('/dashboard')
      }
    }, 2000)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleAtualizarSenha} className={styles.form}>
        <h1 className={styles.titulo}>Atualizar Senha</h1>
        <p style={{ textAlign: 'center', color: '#ccc', marginTop: '-1rem', marginBottom: '1rem' }}>
          Por segurança, você deve criar uma nova senha para o seu primeiro acesso.
        </p>

        <input
          type="password"
          placeholder="Nova Senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          className={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Confirmar Nova Senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          className={styles.input}
          required
        />

        {erro && <div className={styles.erro}>{erro}</div>}
        {sucesso && <div className={styles.sucesso}>{sucesso}</div>}

        <button type="submit" className={styles.botao} disabled={carregando || !!sucesso}>
          {carregando ? 'Atualizando...' : 'Atualizar Senha'}
        </button>
      </form>
    </div>
  )
}
