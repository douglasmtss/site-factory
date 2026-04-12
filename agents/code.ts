// Agent: Code Generator
// Gera o código HTML/JSX do site a partir do conteúdo e design

import type { SiteContent, SiteDesign, AgentResult } from '@/types'
import { buildWhatsAppLink } from '@/skills/whatsapp'

export interface GeneratedCode {
  html: string
  slug: string
}

export function codeAgent(
  content: SiteContent,
  design: SiteDesign,
  whatsappNumber: string,
  slug: string
): AgentResult<GeneratedCode> {
  try {
    const waLink = buildWhatsAppLink({
      number: whatsappNumber,
      businessName: content.title,
      niche: 'negócio',
      context: 'contato',
    })

    const servicesHtml = (content.services ?? [])
      .map(
        (s) => `
      <div class="service-card">
        <span class="service-icon">${s.icon ?? '⭐'}</span>
        <h3>${s.name}</h3>
        <p>${s.description}</p>
      </div>`
      )
      .join('\n')

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${content.seoMeta.title}</title>
  <meta name="description" content="${content.seoMeta.description}" />
  <meta name="keywords" content="${content.seoMeta.keywords.join(', ')}" />
  <meta property="og:title" content="${content.seoMeta.title}" />
  <meta property="og:description" content="${content.seoMeta.description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: ${design.primaryColor};
      --secondary: ${design.secondaryColor};
      --accent: ${design.accentColor};
      --text: #1a1a1a;
      --text-light: #6b7280;
      --bg: #ffffff;
      --radius: 12px;
    }
    body {
      font-family: 'Inter', sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
    }
    a { text-decoration: none; color: inherit; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    /* Header */
    header {
      background: var(--primary);
      color: #fff;
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    header .logo { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; }
    header nav a {
      color: rgba(255,255,255,0.85);
      margin-left: 24px;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    header nav a:hover { color: #fff; }
    /* Hero */
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 80%, #000) 100%);
      color: #fff;
      padding: 100px 0 80px;
      text-align: center;
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 20px;
    }
    .hero p {
      font-size: 1.25rem;
      color: rgba(255,255,255,0.85);
      max-width: 600px;
      margin: 0 auto 36px;
    }
    .btn-whatsapp {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #25D366;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 16px 36px;
      border-radius: 50px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 20px rgba(37,211,102,0.4);
    }
    .btn-whatsapp:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(37,211,102,0.5);
    }
    /* Sections */
    section { padding: 80px 0; }
    section:nth-child(even) { background: #f9fafb; }
    .section-title {
      text-align: center;
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 16px;
    }
    .section-subtitle {
      text-align: center;
      color: var(--text-light);
      font-size: 1.1rem;
      margin-bottom: 56px;
    }
    /* Services */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .service-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: var(--radius);
      padding: 32px 24px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
    }
    .service-icon { font-size: 2.5rem; display: block; margin-bottom: 16px; }
    .service-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; color: var(--primary); }
    .service-card p { color: var(--text-light); font-size: 0.95rem; }
    /* About */
    .about-text {
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
      font-size: 1.1rem;
      color: var(--text-light);
      line-height: 1.8;
    }
    /* CTA Section */
    .cta-section {
      background: var(--primary);
      color: #fff;
      text-align: center;
      padding: 80px 0;
    }
    .cta-section h2 {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 16px;
    }
    .cta-section p {
      font-size: 1.15rem;
      color: rgba(255,255,255,0.8);
      margin-bottom: 36px;
      max-width: 550px;
      margin-left: auto;
      margin-right: auto;
    }
    /* Footer */
    footer {
      background: #0f172a;
      color: rgba(255,255,255,0.6);
      padding: 40px 0;
      text-align: center;
      font-size: 0.9rem;
    }
    footer strong { color: rgba(255,255,255,0.9); }
    /* Floating WhatsApp */
    .floating-wa {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 60px;
      height: 60px;
      background: #25D366;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(37,211,102,0.5);
      z-index: 999;
      transition: transform 0.2s;
    }
    .floating-wa:hover { transform: scale(1.1); }
    .floating-wa svg { width: 32px; height: 32px; fill: #fff; }
    @media (max-width: 640px) {
      header nav { display: none; }
      .hero h1 { font-size: 2rem; }
      .hero p { font-size: 1rem; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="container">
      <span class="logo">${content.title}</span>
      <nav>
        <a href="#servicos">Serviços</a>
        <a href="#sobre">Sobre</a>
        <a href="${waLink}" target="_blank" rel="noopener">Contato</a>
      </nav>
    </div>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="container">
      <h1>${content.hero.headline}</h1>
      <p>${content.hero.subheadline}</p>
      <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp">
        <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        ${content.hero.cta}
      </a>
    </div>
  </section>

  <!-- Services -->
  <section id="servicos">
    <div class="container">
      <h2 class="section-title">Nossos Serviços</h2>
      <p class="section-subtitle">${content.tagline}</p>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <!-- About -->
  <section id="sobre">
    <div class="container">
      <h2 class="section-title">${content.about.title}</h2>
      <p class="about-text">${content.about.text}</p>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="container">
      <h2>${content.contact.cta}</h2>
      <p>${content.description}</p>
      <a href="${waLink}" target="_blank" rel="noopener" class="btn-whatsapp">
        <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        💬 Falar pelo WhatsApp agora
      </a>
    </div>
  </section>

  <!-- Footer -->
  <footer>
    <div class="container">
      <p><strong>${content.title}</strong> &mdash; ${content.tagline}</p>
      <p style="margin-top:8px">Site criado com <strong>Site Factory AI</strong></p>
    </div>
  </footer>

  <!-- Floating WhatsApp -->
  <a href="${waLink}" target="_blank" rel="noopener" class="floating-wa" aria-label="Falar pelo WhatsApp">
    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
  </a>
</body>
</html>`

    return { success: true, data: { html, slug } }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
