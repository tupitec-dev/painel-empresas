'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './SecaoInformacoes.module.css'

interface InfoEmpresa {
  id: string
  chave: string
  valor: string
  descricao: string
}

interface Props {
  empresaId: number
}

export default function SecaoInformacoes({ empresaId }: Props) {
  const [informacoes, setInformacoes] = useState<InfoEmpresa[]>([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [novaInfo, setNovaInfo] = useState({ chave: '', valor: '', descricao: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('informacoes_empresa')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('criado_em', { ascending: false })

      setInformacoes(data || [])
    }

    if (empresaId) {
        carregar()
    }
  }, [empresaId])

  // ALTERADO: Função de cadastrar agora atualiza a tela sem buscar os dados novamente
  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault()

    if (
      !novaInfo.chave.trim() ||
      !novaInfo.valor.trim() ||
      !novaInfo.descricao.trim()
    ) {
      alert('Todos os campos são obrigatórios.')
      return
    }
    
    setLoading(true)
    
    try {
        const { data: novaInformacao, error } = await supabase
            .from('informacoes_empresa')
            .insert({
                empresa_id: empresaId,
                ...novaInfo,
            })
            .select() // Pede ao Supabase para retornar o item criado
            .single() // Como criamos só um, pegamos o objeto único

        if (error) {
            alert('Ocorreu um erro ao cadastrar a informação. Tente novamente.')
            console.error('Erro Supabase:', error)
        } else {
            setNovaInfo({ chave: '', valor: '', descricao: '' })
            setMostrarModal(false)
            // Adiciona a nova informação no início da lista, atualizando a tela
            setInformacoes([novaInformacao, ...informacoes])
        }
    } catch(e) {
        alert('Ocorreu um erro inesperado.')
        console.error(e)
    } finally {
        setLoading(false)
    }
  }

  // NOVO: Função para excluir uma informação
  async function handleExcluir(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir esta informação?')) {
      return
    }

    const { error } = await supabase
      .from('informacoes_empresa')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Ocorreu um erro ao excluir a informação.')
      console.error('Erro Supabase:', error)
    } else {
      // Remove a informação da lista na tela, sem precisar recarregar
      setInformacoes(informacoes.filter(info => info.id !== id))
    }
  }

  return (
    <div className={styles.container}>
      <h2>📄 Informações Personalizadas</h2>
      <button className={styles.botao} onClick={() => setMostrarModal(true)}>
        + Cadastrar informação
      </button>

      {mostrarModal && (
        <div className={styles.modal}>
          <form onSubmit={handleCadastrar}>
            <h4>Nova Informação</h4>

            <label>Chave (ex: horario_funcionamento)</label>
            <input
              placeholder="Ex: horario_funcionamento"
              value={novaInfo.chave}
              onChange={e => setNovaInfo({ ...novaInfo, chave: e.target.value })}
              required
            />

            <label>Valor (ex: Seg a Sex, 8h às 18h)</label>
            <input
              placeholder="Ex: Seg a Sex, 8h às 18h"
              value={novaInfo.valor}
              onChange={e => setNovaInfo({ ...novaInfo, valor: e.target.value })}
              required
            />

            <label>Descrição (para que o GPT deve usar essa informação?)</label>
            <textarea
              className={styles.textarea}
              placeholder="Ex: O GPT deve usar esse valor ao responder perguntas sobre horário de funcionamento"
              value={novaInfo.descricao}
              onChange={e => setNovaInfo({ ...novaInfo, descricao: e.target.value })}
              rows={5}
              required
            />

            <div className={styles.botoes}>
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

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Chave</th>
            <th>Valor</th>
            <th>Descrição</th>
            {/* NOVO: Coluna para as ações */}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {informacoes.map(info => (
            <tr key={info.id}>
              <td>{info.chave}</td>
              <td>{info.valor}</td>
              <td>{info.descricao}</td>
              {/* NOVO: Célula com o botão de excluir */}
              <td>
                <button
                  onClick={() => handleExcluir(info.id)}
                  className={styles.botaoExcluir} // Lembre-se de adicionar este estilo no .css
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