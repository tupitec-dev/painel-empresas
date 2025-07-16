// Tipo base para criar e editar empresa
export interface EmpresaBase {
  nome: string
  estado: string
  telefone: string
  dominio: string
  nome_responsavel: string
  cnpj: string
  pagamento_ok: boolean
  plano: string
  vencimento: number
  criado_em: string
  situacao: 'Ativo' | 'Pendente' | 'Inativo'
}

// Tipo completo com ID (usado após ser salva no Supabase)
export interface Empresa extends EmpresaBase {
  id: number
}
