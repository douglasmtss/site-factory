// /s/[slug] — Rota dinâmica para sites gerados
// Serve os sites criados pela fábrica

import { notFound } from 'next/navigation'
import { connectMongo } from '@/lib/mongodb'
import { Site } from '@/models/Site'
import type { Metadata } from 'next'
import type { GeneratedSite } from '@/types'

interface Props {
  params: { slug: string }
}

type SiteDoc = GeneratedSite & { _id: unknown }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectMongo()
  const site = await Site.findOne({ slug: params.slug }).lean() as SiteDoc | null

  if (!site) {
    return { title: 'Site não encontrado' }
  }

  return {
    title: site.content?.seoMeta?.title ?? site.businessName,
    description: site.content?.seoMeta?.description ?? '',
    keywords: site.content?.seoMeta?.keywords ?? [],
  }
}

export default async function SitePage({ params }: Props) {
  await connectMongo()

  const site = await Site.findOne({ slug: params.slug }).lean() as SiteDoc | null

  if (!site) {
    notFound()
  }

  const { content, design, whatsappLink } = site

  const whatsappNumber = whatsappLink?.match(/wa\.me\/(\d+)/)?.[1] ?? ''

  const services = (content?.services ?? [])
    .map(
      (s: { name: string; description: string; icon?: string }) => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 20px;text-align:center">
      <span style="font-size:2.5rem;display:block;margin-bottom:12px">${s.icon ?? '⭐'}</span>
      <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:8px;color:${design?.primaryColor ?? '#15803d'}">${s.name}</h3>
      <p style="color:#6b7280;font-size:0.9rem">${s.description}</p>
    </div>`
    )
    .join('\n')

  const waMessageEncoded = encodeURIComponent(
    content?.contact?.whatsappText ?? `Olá! Vim pelo site ${site.businessName} e gostaria de mais informações.`
  )
  const waFull = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${waMessageEncoded}`
    : (whatsappLink ?? '#')

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${content?.seoMeta?.title ?? site.businessName}</title>
  <meta name="description" content="${content?.seoMeta?.description ?? ''}"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#1a1a1a;background:#fff;line-height:1.6}
    a{text-decoration:none;color:inherit}
    .container{max-width:1080px;margin:0 auto;padding:0 24px}
    header{background:${design?.primaryColor ?? '#15803d'};color:#fff;padding:16px 0;position:sticky;top:0;z-index:100}
    header .inner{display:flex;justify-content:space-between;align-items:center;max-width:1080px;margin:0 auto;padding:0 24px}
    .logo{font-size:1.4rem;font-weight:800}
    .hero{background:linear-gradient(135deg,${design?.primaryColor ?? '#15803d'},#000d);color:#fff;padding:90px 24px 70px;text-align:center}
    .hero h1{font-size:clamp(2rem,5vw,3.2rem);font-weight:800;line-height:1.2;margin-bottom:18px}
    .hero p{font-size:1.2rem;color:rgba(255,255,255,.85);max-width:580px;margin:0 auto 32px}
    .btn-wa{display:inline-flex;align-items:center;gap:10px;background:#25D366;color:#fff;font-size:1.1rem;font-weight:700;padding:15px 34px;border-radius:50px;box-shadow:0 4px 20px rgba(37,211,102,.4);transition:transform .2s,box-shadow .2s}
    .btn-wa:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(37,211,102,.5)}
    section{padding:72px 0}
    section:nth-child(even){background:#f9fafb}
    .section-title{text-align:center;font-size:2rem;font-weight:800;color:${design?.primaryColor ?? '#15803d'};margin-bottom:12px}
    .section-sub{text-align:center;color:#6b7280;font-size:1.05rem;margin-bottom:48px}
    .services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}
    .about-text{max-width:680px;margin:0 auto;text-align:center;font-size:1.05rem;color:#6b7280;line-height:1.8}
    .cta-sec{background:${design?.primaryColor ?? '#15803d'};color:#fff;text-align:center;padding:72px 0}
    .cta-sec h2{font-size:2rem;font-weight:800;margin-bottom:14px}
    .cta-sec p{font-size:1.1rem;color:rgba(255,255,255,.8);margin-bottom:32px;max-width:520px;margin-left:auto;margin-right:auto}
    footer{background:#0f172a;color:rgba(255,255,255,.55);padding:36px 0;text-align:center;font-size:.875rem}
    footer strong{color:rgba(255,255,255,.9)}
    .float-wa{position:fixed;bottom:24px;right:24px;width:58px;height:58px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(37,211,102,.5);z-index:999;transition:transform .2s}
    .float-wa:hover{transform:scale(1.1)}
    .float-wa svg{width:30px;height:30px;fill:#fff}
    @media(max-width:640px){.hero h1{font-size:1.8rem}.hero p{font-size:1rem}header .nav{display:none}}
  </style>
</head>
<body>
  <header>
    <div class="inner">
      <span class="logo">${site.businessName}</span>
      <nav class="nav">
        <a href="#servicos" style="color:rgba(255,255,255,.8);margin-left:20px;font-size:.95rem">Serviços</a>
        <a href="#sobre" style="color:rgba(255,255,255,.8);margin-left:20px;font-size:.95rem">Sobre</a>
        <a href="${waFull}" target="_blank" style="color:rgba(255,255,255,.8);margin-left:20px;font-size:.95rem">Contato</a>
      </nav>
    </div>
  </header>
  <section class="hero">
    <div class="container">
      <h1>${content?.hero?.headline ?? site.businessName}</h1>
      <p>${content?.hero?.subheadline ?? ''}</p>
      <a href="${waFull}" target="_blank" rel="noopener" class="btn-wa">
        <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        ${content?.hero?.cta ?? 'Falar pelo WhatsApp'}
      </a>
    </div>
  </section>
  <section id="servicos">
    <div class="container">
      <h2 class="section-title">Nossos Serviços</h2>
      <p class="section-sub">${content?.tagline ?? ''}</p>
      <div class="services-grid">${services}</div>
    </div>
  </section>
  <section id="sobre">
    <div class="container">
      <h2 class="section-title">${content?.about?.title ?? 'Sobre nós'}</h2>
      <p class="about-text">${content?.about?.text ?? ''}</p>
    </div>
  </section>
  <div class="cta-sec">
    <div class="container">
      <h2>${content?.contact?.cta ?? 'Entre em contato'}</h2>
      <p>${content?.description ?? ''}</p>
      <a href="${waFull}" target="_blank" rel="noopener" class="btn-wa">
        <svg viewBox="0 0 24 24" style="width:22px;height:22px;fill:#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        💬 Falar pelo WhatsApp agora
      </a>
    </div>
  </div>
  <footer>
    <div class="container">
      <p><strong>${site.businessName}</strong> &mdash; ${content?.tagline ?? ''}</p>
      <p style="margin-top:6px">Site criado com <strong>Site Factory AI</strong></p>
    </div>
  </footer>
  <a href="${waFull}" target="_blank" rel="noopener" class="float-wa" aria-label="WhatsApp">
    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.851L0 24l6.335-1.508A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.816 9.816 0 01-5.007-1.374l-.357-.214-3.76.895.954-3.672-.233-.377A9.82 9.82 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
  </a>
</body>
</html>`

  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{ display: 'contents' }}
    />
  )
}
