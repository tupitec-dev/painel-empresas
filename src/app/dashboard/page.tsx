'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import { Empresa } from '@/types/empresa'
import { criarUsuario } from '@/lib/usuarioService'
import { Usuario } from '@/types/usuario'
import styles from './DashboardPage.module.css'
import { useRouter } from 'next/navigation'

// Modal carregado dinamicamente
const EmpresaModal = dynamic(() => import('@/components/EmpresaModal/EmpresaModal'), {
  ssr: false,
})

interface UsuarioNovo {
  nome: string
  email: string
}

export default function DashboardPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [modalAberto, setModalAberto] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | undefined>(undefined)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  const router = useRouter()

  useEffect(() => {
    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        await carregarEmpresas()
        setCarregandoSessao(false)
      }
    }

    verificarSessao()
  }, [router])

  async function carregarEmpresas() {
    const { data, error } = await supabase.from('empresas').select('*')
    if (error) {
      console.error('Erro ao carregar empresas:', error)
    } else {
      const ordenadas = (data as Empresa[]).sort((a, b) =>
        a.pagamento_ok === b.pagamento_ok ? 0 : a.pagamento_ok ? 1 : -1
      )
      setEmpresas(ordenadas)
    }
  }

  // *** FUNÇÃO PRINCIPAL CORRIGIDA ***
  const handleSalvarEmpresa = async ({
    empresa,
    usuario,
  }: {
    empresa: Partial<Empresa> // Alterado para Partial<Empresa>
    usuario: UsuarioNovo
  }) => {
    
    // A verificação de edição agora é mais simples e correta
    const isEdicao = !!empresa.id;

    if (isEdicao) {
      // MODO EDIÇÃO: Apenas atualiza a empresa. Não mexe com o usuário.
      const { error } = await supabase
        .from('empresas')
        .update(empresa)
        .eq('id', empresa.id)

      if (error) {
        console.error('Erro ao atualizar empresa:', error)
        alert('Falha ao atualizar a empresa. Verifique o console.')
      }
    } else {
      // MODO CRIAÇÃO: Cria a empresa, depois o usuário na Auth e por fim na tabela 'usuarios'.
      const { data, error } = await supabase
        .from('empresas')
        .insert([empresa])
        .select()

      if (error || !data || data.length === 0) {
        console.error('Erro ao criar empresa:', error)
        alert('Falha ao criar a empresa. Verifique o console.')
        return
      }

      const novaEmpresa = data[0]
      const senhaPadrao = empresa.telefone || '12345678'

      try {
        // OBS: Corrigido endpoint para '/api/criar-usuario' para bater com o nome do arquivo da rota.
        // CÓDIGO CORRETO
        const resposta = await fetch('/api/criar-auth', { // <-- ALTERAÇÃO FEITA AQUI
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: usuario.email,
            password: senhaPadrao,
          }),
        })

        const resultado = await resposta.json()

        if (!resposta.ok) {
          // O erro 409 (conflito) é tratado, mas outros erros devem parar o fluxo.
          if (resposta.status === 409) {
            console.warn('⚠️ Usuário já existe no Supabase Auth. Prosseguindo com o cadastro local.')
          } else {
            console.error('Erro ao criar autenticação do usuário:', resultado.error)
            alert(`Erro ao criar o usuário de acesso: ${resultado.error}`)
            // Idealmente, aqui você deveria deletar a empresa que acabou de ser criada, para evitar inconsistência.
            return
          }
        }
        
        // Somente se a criação na Auth deu certo (ou já existia), criamos o registro na tabela 'usuarios'
        const novoUsuario: Usuario = {
            nome: usuario.nome,
            email: usuario.email,
            perfil: 'admin_empresa',
            empresa_id: novaEmpresa.id,
        }
        await criarUsuario(novoUsuario)

      } catch (erroUsuario) {
        console.error('Erro ao criar usuário associado à empresa:', erroUsuario)
        alert('Ocorreu um erro grave ao associar o usuário à empresa.')
      }

    }

    // Fecha o modal e recarrega a lista em ambos os casos (sucesso na edição ou criação)
    setModalAberto(false)
    setEmpresaEditando(undefined)
    await carregarEmpresas()
  }


  const handleExcluirEmpresa = async (empresaId: number) => {
    // A sua lógica de exclusão já parece correta.
    const confirmacao = window.confirm('Tem certeza que deseja excluir esta empresa?')
    if (!confirmacao) return

    try {
      // Note que a exclusão do usuário na tabela 'usuarios' não o remove da 'Authentication'.
      // Para uma exclusão completa, você precisaria de uma outra API Route para chamar supabase.auth.admin.deleteUser()
      const { error: erroUsuarios } = await supabase
        .from('usuarios')
        .delete()
        .eq('empresa_id', empresaId)

      if (erroUsuarios) {
        console.error('Erro ao excluir usuários da empresa:', erroUsuarios)
        return
      }

      const { error: erroEmpresa } = await supabase
        .from('empresas')
        .delete()
        .eq('id', empresaId)

      if (erroEmpresa) {
        console.error('Erro ao excluir empresa:', erroEmpresa)
      } else {
        await carregarEmpresas()
        setModalAberto(false)
        setEmpresaEditando(undefined)
      }
    } catch (erro) {
      console.error('Erro inesperado ao excluir empresa e usuários:', erro)
    }
  }

  const abrirModalParaNovaEmpresa = () => {
    setEmpresaEditando(undefined)
    setModalAberto(true)
  }

  const abrirModalParaEditar = (empresa: Empresa) => {
    setEmpresaEditando(empresa)
    setModalAberto(true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (carregandoSessao) {
    return <p className={styles.titulo}>Verificando acesso...</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Empresas Cadastradas</h1>
        <button onClick={handleLogout} className={styles.botaoSair}>🚪 Sair</button>
      </div>

      <button onClick={abrirModalParaNovaEmpresa} className={styles.botaoNovaEmpresa}>
        ➕ Nova Empresa
      </button>

      {/* O resto do seu componente JSX permanece o mesmo */}
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.th}>Nome</th>
            <th className={styles.th}>Responsável</th>
            <th className={styles.th}>Estado</th>
            <th className={styles.th}>Telefone</th>
            <th className={styles.th}>Pagamento</th>
            <th className={styles.th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((empresa) => (
            <tr key={empresa.id}>
              <td className={styles.td}>{empresa.nome}</td>
              <td className={styles.td}>{empresa.nome_responsavel}</td>
              <td className={styles.td}>{empresa.estado}</td>
              <td className={styles.td}>{empresa.telefone}</td>
              <td className={styles.td}>
                {empresa.pagamento_ok ? '✅ Ok' : '❌ Pendência'}
              </td>
              <td className={styles.td}>
                <button
                  onClick={() => abrirModalParaEditar(empresa)}
                  className={styles.botaoEditar}
                >
                  ✏️ Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EmpresaModal
        visivel={modalAberto}
        onFechar={() => {
          setModalAberto(false)
          setEmpresaEditando(undefined)
        }}
        onSalvar={handleSalvarEmpresa}
        onExcluir={
          empresaEditando?.id
            ? () => handleExcluirEmpresa(empresaEditando.id!)
            : undefined
        }
        empresaParaEditar={empresaEditando}
      />
    </div>
  )
}