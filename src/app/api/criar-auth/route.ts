// src/app/api/criar-usuario/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      // Trata erro de e-mail já existente
      if (
        error.message.includes('already been registered') ||
        error.message.includes('User already registered')
      ) {
        return NextResponse.json(
          { error: 'Usuário já existe', conflict: true },
          { status: 409 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data.user }, { status: 201 })
  } catch (e) {
    console.error('Erro interno:', e)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
