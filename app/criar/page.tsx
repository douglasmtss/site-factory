'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

interface FormState {
  business: string
  city: string
  neighborhood: string
  whatsapp: string
  clientName: string
  monthlyPlan: boolean
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const INITIAL_FORM: FormState = {
  business: '',
  city: '',
  neighborhood: '',
  whatsapp: '',
  clientName: '',
  monthlyPlan: false,
}

export default function CriarPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [status, setStatus] = useState<Status>('idle')
  const [siteUrl, setSiteUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setSiteUrl('')
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: form.business.trim(),
          city: form.city.trim(),
          neighborhood: form.neighborhood.trim() || undefined,
          whatsapp: form.whatsapp.trim() || undefined,
          clientName: form.clientName.trim() || undefined,
          monthlyPlan: form.monthlyPlan,
        }),
      })

      const data = await res.json()

      if (data.success && data.url) {
        setSiteUrl(data.url)
        setStatus('success')
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      } else {
        setErrorMsg(data.error ?? 'Erro desconhecido. Tente novamente.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Falha de conexão. Verifique sua internet e tente novamente.')
      setStatus('error')
    }
  }

  function handleReset() {
    setForm(INITIAL_FORM)
    setStatus('idle')
    setSiteUrl('')
    setErrorMsg('')
  }

  const isLoading = status === 'loading'

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight hover:text-green-400 transition-colors">
            🏭 Site Factory AI
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold px-4 py-2 rounded-full mb-5">
            🤖 Geração com IA
          </div>
          <h1 className="text-4xl font-black mb-4">
            Criar site profissional
          </h1>
          <p className="text-gray-400 text-lg">
            Preencha os dados do negócio e a IA cria o site completo em minutos.
          </p>
        </div>

        {/* Form */}
        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* business */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="business">
                Nome do negócio <span className="text-green-400">*</span>
              </label>
              <input
                id="business"
                name="business"
                type="text"
                required
                disabled={isLoading}
                value={form.business}
                onChange={handleChange}
                placeholder="Ex: Barbearia do João, Pizzaria Bella Napoli"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* city */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="city">
                Cidade <span className="text-green-400">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                disabled={isLoading}
                value={form.city}
                onChange={handleChange}
                placeholder="Ex: Rio de Janeiro, São Paulo, Niterói"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* neighborhood + whatsapp side by side on md+ */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="neighborhood">
                  Bairro <span className="text-gray-500 font-normal">(opcional)</span>
                </label>
                <input
                  id="neighborhood"
                  name="neighborhood"
                  type="text"
                  disabled={isLoading}
                  value={form.neighborhood}
                  onChange={handleChange}
                  placeholder="Ex: Copacabana, Icaraí"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="whatsapp">
                  WhatsApp <span className="text-gray-500 font-normal">(opcional)</span>
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  disabled={isLoading}
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Ex: 21999999999"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* clientName */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="clientName">
                Nome do responsável <span className="text-gray-500 font-normal">(opcional)</span>
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                disabled={isLoading}
                value={form.clientName}
                onChange={handleChange}
                placeholder="Ex: João, Maria"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* monthlyPlan */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="monthlyPlan"
                id="monthlyPlan"
                disabled={isLoading}
                checked={form.monthlyPlan}
                onChange={handleChange}
                className="w-5 h-5 rounded accent-green-500 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                Plano mensal (R$19/mês)
                <span className="ml-2 text-gray-500 text-xs">— em vez de R$97 único</span>
              </span>
            </label>

            {/* Error */}
            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                ❌ {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !form.business.trim() || !form.city.trim()}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Gerando site com IA…
                </>
              ) : (
                '🚀 Gerar site agora'
              )}
            </button>

            {isLoading && (
              <p className="text-center text-sm text-gray-500 animate-pulse">
                A IA está criando conteúdo, SEO e design. Isso pode levar até 2 minutos…
              </p>
            )}
          </form>
        )}

        {/* Success */}
        {status === 'success' && (
          <div ref={resultRef} className="text-center space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-green-400 mb-2">Site criado com sucesso!</h2>
              <p className="text-gray-400 mb-6 text-sm">
                O site está online e pronto para receber clientes.
              </p>
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20 mb-4 w-full justify-center"
              >
                🌐 Abrir site gerado →
              </a>
              <div className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-400 font-mono break-all">
                {siteUrl}
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4"
            >
              Criar outro site
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  )
}
