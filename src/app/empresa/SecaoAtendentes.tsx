'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './SecaoAtendentes.module.css'

interface Atendente {
  id: string
  nome: string
  estilo_personalidade: string
  dialeto: string
}

interface Props {
  empresaId: number
}

export default function SecaoAtendentes({ empresaId }: Props) {
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [novoAtendente, setNovoAtendente] = useState({
    nome: '',
    estilo_personalidade: '',
    dialeto: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('atendentes')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('criado_em', { ascending: false })

      setAtendentes(data || [])
    }

    if (empresaId) {
        carregar()
    }
  }, [empresaId])

  // ALTERADO: Função de cadastrar agora atualiza a tela de forma otimizada
  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault()

    if (
      !novoAtendente.nome.trim() ||
      !novoAtendente.estilo_personalidade.trim() ||
      !novoAtendente.dialeto.trim()
    ) {
      alert('Todos os campos são obrigatórios.')
      return
    }

    setLoading(true)

    try {
        const { data: novoAtendenteCriado, error } = await supabase
            .from('atendentes')
            .insert({
                empresa_id: empresaId,
                ...novoAtendente,
            })
            .select()
            .single()

        if (error) {
            alert('Ocorreu um erro ao cadastrar o atendente. Tente novamente.')
            console.error('Erro Supabase:', error)
        } else {
            setNovoAtendente({ nome: '', estilo_personalidade: '', dialeto: '' })
            setMostrarModal(false)
            // Adiciona o novo atendente no início da lista na tela
            setAtendentes([novoAtendenteCriado, ...atendentes])
        }
    } catch (e) {
        alert('Ocorreu um erro inesperado.')
        console.error(e);
    } finally {
        setLoading(false)
    }
  }

  // NOVO: Função para excluir um atendente
  async function handleExcluir(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este atendente?')) {
      return
    }

    const { error } = await supabase
      .from('atendentes')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Ocorreu um erro ao excluir o atendente.')
      console.error('Erro Supabase:', error)
    } else {
      // Remove o atendente da lista na tela
      setAtendentes(atendentes.filter(at => at.id !== id))
    }
  }

  return (
    <div className={styles.container}>
      <h2>👥 Atendentes</h2>
      <button className={styles.botao} onClick={() => setMostrarModal(true)}>
        + Cadastrar atendente
      </button>

      {mostrarModal && (
        <div className={styles.modal}>
          <form onSubmit={handleCadastrar}>
            <h4>Novo Atendente</h4>
            <input
              placeholder="Nome"
              value={novoAtendente.nome}
              onChange={e => setNovoAtendente({ ...novoAtendente, nome: e.target.value })}
              required
            />
            <input
              placeholder="Estilo de personalidade (Ex: Amigável e prestativo)"
              value={novoAtendente.estilo_personalidade}
              onChange={e => setNovoAtendente({ ...novoAtendente, estilo_personalidade: e.target.value })}
              required
            />
            <input
              placeholder="Dialeto (Ex: Português informal do Brasil)"
              value={novoAtendente.dialeto}
              onChange={e => setNovoAtendente({ ...novoAtendente, dialeto: e.target.value })}
              required
            />
            <div className={styles.botoes}>
              <button type="submit" className={styles.botao} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setMostrarModal(false)} className={styles.botaoSecundario}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Estilo</th>
            <th>Dialeto</th>
            {/* NOVO: Coluna para as ações */}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {atendentes.map(at => (
            <tr key={at.id}>
              <td>{at.nome}</td>
              <td>{at.estilo_personalidade}</td>
              <td>{at.dialeto}</td>
              {/* NOVO: Célula com o botão de excluir */}
              <td>
                <button
                  onClick={() => handleExcluir(at.id)}
                  className={styles.botaoExcluir} // Use o mesmo estilo do outro arquivo
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}