'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Empresa } from '@/types/empresa'
import styles from './EmpresaPage.module.css'
import SecaoInformacoes from './SecaoInformacoes'
import SecaoAtendentes from './SecaoAtendentes'

// NOVO: Função para aplicar a máscara de telefone
const aplicarMascaraTelefone = (valor: string) => {
  if (!valor) return ''
  // Remove todos os caracteres que não são dígitos
  const numeros = valor.replace(/\D/g, '')

  // Limita a 11 dígitos (DDD + 9 dígitos)
  if (numeros.length > 11) {
    return numeros.slice(0, 11)
  }

  // Aplica a máscara (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
  if (numeros.length <= 10) {
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return numeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function carregarEmpresaDoUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('email', user.email)
        .single()

      if (!usuario?.empresa_id) {
        console.error('Empresa não encontrada.')
        return
      }

      const { data } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', usuario.empresa_id)
        .single()

      // ALTERADO: Aplica a máscara ao carregar os dados
      if (data) {
        setEmpresa({
          ...data,
          telefone: aplicarMascaraTelefone(data.telefone),
        })
      }
    }

    carregarEmpresaDoUsuario()
  }, [router])

  // ALTERADO: Função de salvar com validação e remoção da máscara
  async function salvarEmpresa() {
    if (!empresa) return
    
    // 1. Remove a máscara para validação e para salvar
    const telefoneNumeros = empresa.telefone.replace(/\D/g, '')

    // 2. Valida se o telefone tem no mínimo 10 dígitos (DDD + número)
    if (telefoneNumeros.length < 10) {
      alert('O número de telefone é inválido. Por favor, insira um número com DDD.')
      return // Interrompe a execução se for inválido
    }

    setLoading(true)

    // 3. Salva no banco de dados apenas os números
    const { error } = await supabase
      .from('empresas')
      .update({
        telefone: telefoneNumeros, // Salva o número sem máscara
      })
      .eq('id', empresa.id)

    if (error) {
      console.error('Erro ao salvar empresa:', error)
      alert('Ocorreu um erro ao salvar as alterações.')
    } else {
      alert('Alterações salvas com sucesso!')
    }

    setLoading(false)
  }

  async function deslogarUsuario() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!empresa) return <p>Carregando dados da empresa...</p>

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.titulo}>Painel da Empresa</h1>
        <button onClick={deslogarUsuario} className={styles.botao} style={{ backgroundColor: '#e74c3c' }}>
          Sair
        </button>
      </div>

      <div>
        <label className={styles.label}><strong>Nome:</strong></label>
        <input
          className={styles.input}
          value={empresa.nome}
          readOnly
        />

        <label className={styles.label}><strong>Responsável:</strong></label>
        <input
          className={styles.input}
          value={empresa.nome_responsavel}
          readOnly
        />

        <label className={styles.label}><strong>Telefone:</strong></label>
        <input
          className={styles.input}
          value={empresa.telefone}
          // ALTERADO: Aplica a máscara enquanto o usuário digita
          onChange={e => setEmpresa({ ...empresa, telefone: aplicarMascaraTelefone(e.target.value) })}
          placeholder="(XX) XXXXX-XXXX"
          maxLength={15} // (XX) XXXXX-XXXX tem 15 caracteres
        />

        <p className={styles.paragrafo}>
          <strong>Plano:</strong> {empresa.plano}
        </p>
        <p className={styles.paragrafo}>
          <strong>Status:</strong> {empresa.pagamento_ok ? '✅ Em dia' : '❌ Pendência'}
        </p>

        <button
          className={styles.botao}
          onClick={salvarEmpresa}
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <SecaoInformacoes empresaId={empresa.id} />
      <SecaoAtendentes empresaId={empresa.id} />
    </div>
  )
}