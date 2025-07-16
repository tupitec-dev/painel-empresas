'use client'

import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import styles from './EmpresaModal.module.css'
import { Empresa } from '@/types/empresa'
import { supabase } from '@/lib/supabase'

interface UsuarioNovo {
  nome: string
  email: string
}

// ATENÇÃO: A interface foi ajustada para aceitar um objeto com id opcional.
interface EmpresaModalProps {
  visivel: boolean
  onFechar: () => void
  onSalvar: (dados: { empresa: Partial<Empresa>; usuario: UsuarioNovo }) => void
  onExcluir?: () => void
  empresaParaEditar?: Empresa
}

const aplicarMascaraTelefone = (valor: string) => {
  const numeros = valor.replace(/\D/g, '')
  if (numeros.length <= 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }
  return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

const aplicarMascaraCNPJ = (valor: string) => {
  const numeros = valor.replace(/\D/g, '')
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export default function EmpresaModal({
  visivel,
  onFechar,
  onSalvar,
  onExcluir,
  empresaParaEditar,
}: EmpresaModalProps) {
  const [empresa, setEmpresa] = useState<Omit<Empresa, 'id'>>({
    nome: '',
    estado: '',
    telefone: '',
    dominio: '',
    nome_responsavel: '',
    cnpj: '',
    pagamento_ok: false,
    plano: 'free',
    vencimento: 1,
    criado_em: new Date().toISOString().split('T')[0],
    situacao: 'Pendente',
  })

  const [emailResponsavel, setEmailResponsavel] = useState('')

  useEffect(() => {
    async function carregarEmpresaEUsuario() {
      if (empresaParaEditar) {
        const { id, telefone, cnpj, ...resto } = empresaParaEditar

        setEmpresa({
          ...resto,
          telefone: aplicarMascaraTelefone(telefone),
          cnpj: aplicarMascaraCNPJ(cnpj),
        })

        const { data, error: _error } = await supabase
          .from('usuarios')
          .select('email')
          .eq('empresa_id', id)
          .eq('perfil', 'admin_empresa')
          .single()

        if (data?.email) {
          setEmailResponsavel(data.email)
        }
      } else {
        setEmpresa({
          nome: '',
          estado: '',
          telefone: '',
          dominio: '',
          nome_responsavel: '',
          cnpj: '',
          pagamento_ok: false,
          plano: 'free',
          vencimento: 1,
          criado_em: new Date().toISOString().split('T')[0],
          situacao: 'Pendente',
        })
        setEmailResponsavel('')
      }
    }

    carregarEmpresaEUsuario()
  }, [empresaParaEditar])

  if (!visivel) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    let valor = value

    if (name === 'telefone') valor = aplicarMascaraTelefone(value)
    if (name === 'cnpj') valor = aplicarMascaraCNPJ(value)

    setEmpresa((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(valor) : valor,
    }))
  }
  
  const handleTogglePagamento = () => {
    setEmpresa((prev) => ({
      ...prev,
      pagamento_ok: !prev.pagamento_ok,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const camposObrigatorios = [
      'nome',
      'estado',
      'telefone',
      'dominio',
      'nome_responsavel',
      'plano',
      'situacao',
      'vencimento',
    ]

    for (const campo of camposObrigatorios) {
      if (!empresa[campo as keyof typeof empresa]) {
        alert(`Preencha o campo obrigatório: ${campo}`)
        return
      }
    }

    if (!emailResponsavel) {
      alert('Preencha o campo obrigatório: email do responsável')
      return
    }

    const usuario: UsuarioNovo = {
      nome: empresa.nome_responsavel,
      email: emailResponsavel,
    }

    // *** ALTERAÇÃO PRINCIPAL AQUI ***
    // Ao salvar, recriamos o objeto da empresa, adicionando o 'id' se estiver editando.
    const empresaParaSalvar: Partial<Empresa> = {
        ...empresa,
        telefone: empresa.telefone.replace(/\D/g, ''),
        cnpj: empresa.cnpj.replace(/\D/g, ''),
    };

    if (empresaParaEditar?.id) {
        empresaParaSalvar.id = empresaParaEditar.id;
    }

    onSalvar({
      empresa: empresaParaSalvar,
      usuario,
    })
  }

  const telefoneNumeros = empresa.telefone.replace(/\D/g, '')
  const whatsappLink = `https://wa.me/55${telefoneNumeros}`

  // VERSÃO CORRIGIDA (SEM CONFIRMAÇÃO)
  const handleExcluirClick = () => {
    if (onExcluir) {
      onExcluir(); // Apenas chama a função passada pelo pai
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.title}>
          {empresaParaEditar ? 'Editar Empresa' : 'Nova Empresa'}
        </h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input name="nome" placeholder="Nome da Empresa" value={empresa.nome} onChange={handleChange} className={styles.input} />
          
          <select name="estado" value={empresa.estado} onChange={handleChange} className={styles.input}>
            <option value="">Selecione o Estado</option>
            {[
              'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
              'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
              'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro',
              'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima',
              'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
            ].map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>

          <div className={styles.row}>
            <input
              name="telefone"
              placeholder="Telefone"
              value={empresa.telefone}
              onChange={handleChange}
              className={styles.input}
              maxLength={15}
            />
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className={styles.whatsappIcon} />
            </a>
          </div>

          <input name="dominio" placeholder="Domínio" value={empresa.dominio} onChange={handleChange} className={styles.input} />

          <input name="nome_responsavel" placeholder="Nome do Responsável" value={empresa.nome_responsavel} onChange={handleChange} className={styles.input} />

          {/* *** ALTERAÇÃO AQUI *** */}
          {/* Adicionado 'disabled' para o modo de edição */}
          <input 
            type="email" 
            placeholder="Email do Responsável" 
            value={emailResponsavel} 
            onChange={(e) => setEmailResponsavel(e.target.value)} 
            className={styles.input}
            disabled={!!empresaParaEditar}
            title={empresaParaEditar ? "O e-mail do usuário não pode ser alterado na edição." : ""}
          />

          <input name="cnpj" placeholder="CNPJ" value={empresa.cnpj} onChange={handleChange} className={styles.input} maxLength={18} />

          <select name="plano" value={empresa.plano} onChange={handleChange} className={styles.input}>
            <option value="">Selecione o plano</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>

          <select name="situacao" value={empresa.situacao} onChange={handleChange} className={styles.input}>
            <option value="Ativo">Ativo</option>
            <option value="Pendente">Pendente</option>
            <option value="Inativo">Inativo</option>
          </select>

          <input type="number" name="vencimento" min={1} max={31} placeholder="Dia de vencimento (1 a 31)" value={empresa.vencimento} onChange={handleChange} className={styles.input} />

          <button type="button" onClick={handleTogglePagamento} className={`${styles.toggleChatBtn} ${empresa.pagamento_ok ? styles.desativado : ''}`}>
            {empresa.pagamento_ok ? 'Pagamento OK' : 'Pagamento Pendente'}
          </button>

          <div className={styles.criadoEm}>
            Criado em: <span>{new Date(empresa.criado_em).toLocaleDateString('pt-BR')}</span>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onFechar} className={styles.cancelBtn}>
              Cancelar
            </button>

            {empresaParaEditar && onExcluir && (
              <button type="button" onClick={handleExcluirClick} className={styles.cancelBtn}>
                🗑️ Excluir Empresa
              </button>
            )}

            <button type="submit" className={styles.saveBtn}>
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}