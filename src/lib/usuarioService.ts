import { supabase } from './supabase'
import { Usuario } from '../types/usuario'

export async function criarUsuario(usuario: Usuario): Promise<Usuario> {
  const { data, error } = await supabase
    .from('usuarios')
    .insert([usuario])
    .select() // garante que os dados inseridos sejam retornados

  if (error) throw error
  if (!data || data.length === 0) throw new Error('Usuário não foi criado.')

  return data[0]
}
