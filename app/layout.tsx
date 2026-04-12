import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Site Factory AI — Crie sites profissionais em 2 minutos',
  description:
    'Criamos sites profissionais para pequenos negócios usando inteligência artificial. Pronto em 2 minutos, com botão WhatsApp e SEO local. R$97 ou R$19/mês.',
  keywords: [
    'criar site barato',
    'site para pequenos negócios',
    'site profissional rj',
    'site com whatsapp',
    'criar site rápido',
  ],
  openGraph: {
    title: 'Site Factory AI',
    description: 'Sites profissionais criados por IA em menos de 2 minutos',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
