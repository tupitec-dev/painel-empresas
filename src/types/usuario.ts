export interface Usuario {
  id?: string
  email: string
  nome?: string
  perfil: 'tupitec_master' | 'tupitec_staff' | 'admin_empresa'
  empresa_id?: number
  criado_em?: string
}
