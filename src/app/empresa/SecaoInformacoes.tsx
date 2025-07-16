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
  // NOVO: Estado de loading para o botão de salvar
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

  // ALTERADO: Função de cadastrar agora é um handler de form com validação
  async function handleCadastrar(e: React.FormEvent) {
    e.preventDefault() // Previne o comportamento padrão de submissão do formulário

    // 1. Validação dos campos
    if (
      !novaInfo.chave.trim() ||
      !novaInfo.valor.trim() ||
      !novaInfo.descricao.trim()
    ) {
      alert('Todos os campos são obrigatórios.')
      return // Interrompe a função se a validação falhar
    }
    
    setLoading(true)
    
    try {
        const { error } = await supabase.from('informacoes_empresa').insert({
            empresa_id: empresaId,
            ...novaInfo,
        })

        if (error) {
            alert('Ocorreu um erro ao cadastrar a informação. Tente novamente.')
            console.error('Erro Supabase:', error)
        } else {
            setNovaInfo({ chave: '', valor: '', descricao: '' })
            setMostrarModal(false)

            const { data: atualizadas } = await supabase
                .from('informacoes_empresa')
                .select('*')
                .eq('empresa_id', empresaId)
                .order('criado_em', { ascending: false })

            setInformacoes(atualizadas || [])
        }
    } catch(e) {
        alert('Ocorreu um erro inesperado.')
        console.error(e)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h2>📄 Informações Personalizadas</h2>
      <button className={styles.botao} onClick={() => setMostrarModal(true)}>
        + Cadastrar informação
      </button>

      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Chave</th>
            <th>Valor</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {informacoes.map(info => (
            <tr key={info.id}>
              <td>{info.chave}</td>
              <td>{info.valor}</td>
              <td>{info.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarModal && (
        <div className={styles.modal}>
          {/* ALTERADO: Uso de <form> para melhor semântica e validação nativa */}
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