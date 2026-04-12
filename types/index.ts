// Tipos centrais do Site Factory

export interface BusinessInput {
  business: string   // tipo/nome do negócio (ex: "Hamburgueria Lamar")
  city: string       // cidade (ex: "Rio de Janeiro")
  neighborhood?: string  // bairro (ex: "Copacabana")
  whatsapp?: string  // número WhatsApp do cliente
  clientName?: string
}

export interface SitePlan {
  pages: string[]
  sections: string[]
  tone: string
  keywords: string[]
  niche: string
  colorScheme: {
    primary: string
    secondary: string
    style: string
  }
}

export interface SiteContent {
  title: string
  tagline: string
  description: string
  hero: {
    headline: string
    subheadline: string
    cta: string
  }
  about: {
    title: string
    text: string
  }
  services: Service[]
  contact: {
    cta: string
    whatsappText: string
  }
  seoMeta: {
    title: string
    description: string
    keywords: string[]
  }
}

export interface Service {
  name: string
  description: string
  icon?: string
}

export interface SiteDesign {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  style: 'modern' | 'premium' | 'minimal' | 'bold'
  layout: 'landing' | 'multipage'
}

export interface GeneratedSite {
  slug: string
  businessName: string
  city: string
  neighborhood?: string
  niche: string
  plan: SitePlan
  content: SiteContent
  design: SiteDesign
  whatsappLink: string
  deployUrl?: string
  createdAt: Date
  status: 'draft' | 'published' | 'error'
  clientWhatsapp?: string
  monthlyPlan?: boolean
}

export interface BulkGenerateItem {
  business: string
  city: string
  neighborhood?: string
  whatsapp?: string
}

export interface AgentResult<T> {
  success: boolean
  data?: T
  error?: string
}
