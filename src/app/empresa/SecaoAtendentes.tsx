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
  // NOVO: Estado de loading para o botão de salvar
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

  // ALTERADO: Função de cadastrar agora tem validação
  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault() // Previne o recarregamento da página pelo form

    // 1. Validação dos campos
    if (
      !novoAtendente.nome.trim() ||
      !novoAtendente.estilo_personalidade.trim() ||
      !novoAtendente.dialeto.trim()
    ) {
      alert('Todos os campos são obrigatórios.')
      return // Interrompe a função se a validação falhar
    }

    setLoading(true)

    try {
        const { error } = await supabase.from('atendentes').insert({
            empresa_id: empresaId,
            ...novoAtendente,
        })

        if (error) {
            alert('Ocorreu um erro ao cadastrar o atendente. Tente novamente.')
            console.error('Erro Supabase:', error)
        } else {
            // Limpa o formulário e fecha o modal
            setNovoAtendente({ nome: '', estilo_personalidade: '', dialeto: '' })
            setMostrarModal(false)

            // Recarrega a lista de atendentes para exibir o novo registro
            const { data: atualizados } = await supabase
                .from('atendentes')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('criado_em', { ascending: false })

            setAtendentes(atualizados || [])
        }
    } catch (e) {
        alert('Ocorreu um erro inesperado.')
        console.error(e);
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2>👥 Atendentes</h2>
      <button className={styles.botao} onClick={() => setMostrarModal(true)}>
        + Cadastrar atendente
      </button>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Estilo</th>
            <th>Dialeto</th>
          </tr>
        </thead>
        <tbody>
          {atendentes.map(at => (
            <tr key={at.id}>
              <td>{at.nome}</td>
              <td>{at.estilo_personalidade}</td>
              <td>{at.dialeto}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div className={styles.modal}>
          {/* ALTERADO: Uso de <form> para melhor semântica e acessibilidade */}
          <form onSubmit={handleCadastrar}>
            <h4>Novo Atendente</h4>
            <input
              placeholder="Nome"
              value={novoAtendente.nome}
              onChange={e => setNovoAtendente({ ...novoAtendente, nome: e.target.value })}
              required // Validação nativa do navegador
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
              {/* ALTERADO: Botão de salvar com estado de loading */}
              <button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" onClick={() => setMostrarModal(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}