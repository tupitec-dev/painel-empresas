import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel Empresas • Tupitec',
  description: 'Gerencie empresas, usuários e planos com o WebChat Tupitec.',
  openGraph: {
    title: 'Painel Empresas • Tupitec',
    description: 'Acesse o painel administrativo das empresas no WebChat Tupitec.',
    url: 'https://painel-empresas.vercel.app/login',
    siteName: 'Painel Empresas',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Painel Empresas',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Painel Empresas • Tupitec',
    description: 'Administre sua empresa com o WebChat Tupitec.',
    images: ['/og-image.jpg'],
  },
}
