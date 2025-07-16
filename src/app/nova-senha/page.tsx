'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './NovaSenhaPage.module.css'

export default function NovaSenhaPage() {
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
        setErro('Sessão inválida. Por favor, tente o link novamente.')
      }
    }
    verificarSessao()
  }, [])

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

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setErro('Erro ao redefinir senha. Link pode ter expirado.')
      setCarregando(false)
      return
    }

    setSucesso('Senha atualizada com sucesso! Redirecionando para login...')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleAtualizarSenha} className={styles.form}>
        <h1 className={styles.titulo}>Redefinir Senha</h1>

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
          {carregando ? 'Salvando...' : 'Atualizar Senha'}
        </button>
      </form>
    </div>
  )
}
