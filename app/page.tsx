import Link from 'next/link'

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? '5521999999999'
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Ol%C3%A1%21+Quero+criar+meu+site+profissional+por+R%2497`

const features = [
  { icon: '⚡', title: 'Pronto em 2 minutos', desc: 'Nossa IA gera o site completo enquanto você espera' },
  { icon: '📱', title: 'Botão WhatsApp integrado', desc: 'Clientes chegam direto no seu WhatsApp, 24h por dia' },
  { icon: '🔍', title: 'SEO local otimizado', desc: 'Seu site aparece no Google quando alguém busca na sua cidade' },
  { icon: '📲', title: 'Funciona em celular', desc: 'Design responsivo, bonito em qualquer tela' },
  { icon: '🚀', title: 'Online imediatamente', desc: 'Publicado na internet assim que pronto, sem complicação' },
  { icon: '💰', title: 'Preço acessível', desc: 'R$97 único ou R$19/mês — muito menos que uma agência' },
]

const niches = [
  { icon: '💈', label: 'Barbearias' },
  { icon: '🍔', label: 'Hamburguerias' },
  { icon: '🍕', label: 'Pizzarias' },
  { icon: '💅', label: 'Salões de Beleza' },
  { icon: '✨', label: 'Estética' },
  { icon: '🔧', label: 'Mecânicas' },
  { icon: '⚖️', label: 'Advogados' },
  { icon: '🏪', label: 'Lojas Locais' },
]

const steps = [
  { num: '1', title: 'Você informa o negócio', desc: 'Nome, cidade e WhatsApp — só isso.' },
  { num: '2', title: 'A IA cria tudo', desc: 'Conteúdo, design, SEO e código em segundos.' },
  { num: '3', title: 'Site no ar', desc: 'Pronto para receber clientes pelo WhatsApp.' },
]

const testimonials = [
  {
    name: 'João Silva',
    niche: 'Barbearia — Rio de Janeiro',
    text: 'Recebi 3 clientes novos na primeira semana só pelo site. Valeu demais cada centavo!',
  },
  {
    name: 'Ana Costa',
    niche: 'Salão de Beleza — Niterói',
    text: 'Antes ficava dependendo do Instagram. Agora tenho site próprio com WhatsApp. Profissional demais!',
  },
  {
    name: 'Carlos Mecanica',
    niche: 'Mecânica — Duque de Caxias',
    text: 'Cliente me achou no Google e veio direto pelo site. Nunca imaginei que seria tão simples.',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <span className="text-xl font-black tracking-tight">
            🏭 Site Factory AI
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            <Link href="#como-funciona" className="hover:text-white transition-colors">Como funciona</Link>
            <Link href="#nichos" className="hover:text-white transition-colors">Nichos</Link>
            <Link href="#precos" className="hover:text-white transition-colors">Preços</Link>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-400 transition-colors"
            >
              Criar meu site
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            🤖 Powered by Inteligência Artificial
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
            Crie seu site profissional
            <br />
            <span className="text-green-400">em menos de 2 minutos</span> 🚀
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Sem complicação. Sem precisar entender de tecnologia.
            Nossa IA cria um site completo para o seu negócio —
            pronto para receber clientes pelo WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-green-500/30 transition-all hover:-translate-y-1"
            >
              <WhatsAppIcon />
              Criar meu site agora — R$97
            </a>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-all"
            >
              Ver como funciona →
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span>✅ Mais de 500 sites criados</span>
            <span>✅ SEO local incluído</span>
            <span>✅ Online em minutos</span>
          </div>
        </div>
      </section>

      {/* Ideal para (nichos) */}
      <section id="nichos" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Ideal para qualquer negócio local
          </h2>
          <p className="text-gray-500 text-lg mb-12">
            Se você precisa de clientes, você precisa de um site.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {niches.map((n) => (
              <div
                key={n.label}
                className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-4xl block mb-3">{n.icon}</span>
                <span className="font-semibold text-gray-800">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Como funciona
          </h2>
          <p className="text-gray-500 text-lg mb-14">3 passos simples. Sem nenhum conhecimento técnico.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="relative">
                <div className="w-16 h-16 rounded-full bg-green-500 text-white text-2xl font-black flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                  {s.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 text-center mb-4">
            Tudo que seu negócio precisa
          </h2>
          <p className="text-gray-500 text-lg text-center mb-14">
            Cada site é criado com as estratégias dos negócios mais bem-sucedidos da região.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl block mb-3">{f.icon}</span>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            O que os clientes dizem
          </h2>
          <p className="text-gray-500 text-lg mb-14">Resultados reais de negócios reais.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100"
              >
                <p className="text-gray-700 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-sm text-green-600">{t.niche}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Preço justo, resultado real
          </h2>
          <p className="text-gray-500 text-lg mb-14">
            Se o site te trouxer 1 cliente, já se pagou.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Plano único */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
              <h3 className="font-bold text-gray-500 text-sm uppercase tracking-widest mb-2">Pagamento Único</h3>
              <div className="text-5xl font-black text-gray-900 mb-1">R$97</div>
              <p className="text-gray-400 text-sm mb-6">pague uma vez, site é seu</p>
              <ul className="text-left space-y-3 mb-8 text-sm text-gray-600">
                <li>✅ Site profissional completo</li>
                <li>✅ Link online imediato</li>
                <li>✅ Botão WhatsApp</li>
                <li>✅ SEO local</li>
                <li>✅ Hospedagem por 1 ano</li>
              </ul>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Quero esse plano
              </a>
            </div>
            {/* Plano mensal */}
            <div className="bg-green-500 rounded-2xl border-2 border-green-500 p-8 text-center relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full">
                MAIS POPULAR
              </div>
              <h3 className="font-bold text-green-100 text-sm uppercase tracking-widest mb-2">Plano Mensal</h3>
              <div className="text-5xl font-black text-white mb-1">R$19<span className="text-2xl">/mês</span></div>
              <p className="text-green-100 text-sm mb-6">sem fidelidade — cancele quando quiser</p>
              <ul className="text-left space-y-3 mb-8 text-sm text-green-50">
                <li>✅ Site profissional completo</li>
                <li>✅ Hospedagem inclusa</li>
                <li>✅ Botão WhatsApp</li>
                <li>✅ SEO local</li>
                <li>✅ Atualizações gratuitas</li>
              </ul>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white text-green-600 font-bold py-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                Assinar agora
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-green-600 to-green-500 py-20 px-6 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Pronto para ter mais clientes pelo WhatsApp?
          </h2>
          <p className="text-green-100 text-lg mb-10">
            Criamos seu site profissional em menos de 2 minutos.
            Sem complicação, sem precisar de técnico.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-green-600 font-bold text-lg px-10 py-5 rounded-full shadow-lg hover:-translate-y-1 transition-all"
          >
            <WhatsAppIcon className="text-green-500" />
            Criar meu site agora — R$97
          </a>
          <p className="mt-6 text-green-100 text-sm">
            Resposta em menos de 5 minutos · Sem burocracia
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <div className="max-w-5xl mx-auto">
          <p className="font-bold text-white text-lg mb-2">🏭 Site Factory AI</p>
          <p className="mb-4">Sites profissionais criados por inteligência artificial para pequenos negócios do Brasil.</p>
          <p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400">
              WhatsApp
            </a>
            {' '}&middot;{' '}
            <a href="#precos" className="hover:text-white">Preços</a>
            {' '}&middot;{' '}
            <a href="#como-funciona" className="hover:text-white">Como funciona</a>
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 hover:scale-110 transition-transform z-50"
        aria-label="Falar pelo WhatsApp"
      >
        <WhatsAppIcon size={30} />
      </a>
    </main>
  )
}

function WhatsAppIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={{ fill: '#fff' }}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
    </svg>
  )
}
