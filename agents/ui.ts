// Agent: UI Generator
// Define o design, cores, fontes e estilo visual do site

import type { SitePlan, SiteDesign, AgentResult } from '@/types'

const styleMap: Record<string, SiteDesign> = {
  Barbearia: {
    primaryColor: '#1a1a2e',
    secondaryColor: '#e94560',
    accentColor: '#f5a623',
    fontFamily: "'Playfair Display', serif",
    style: 'premium',
    layout: 'landing',
  },
  Hamburgueria: {
    primaryColor: '#b5451b',
    secondaryColor: '#f5a623',
    accentColor: '#ffffff',
    fontFamily: "'Oswald', sans-serif",
    style: 'bold',
    layout: 'landing',
  },
  Pizzaria: {
    primaryColor: '#c0392b',
    secondaryColor: '#f39c12',
    accentColor: '#fdfdfd',
    fontFamily: "'Roboto', sans-serif",
    style: 'bold',
    layout: 'landing',
  },
  Restaurante: {
    primaryColor: '#2c3e50',
    secondaryColor: '#e67e22',
    accentColor: '#ecf0f1',
    fontFamily: "'Merriweather', serif",
    style: 'premium',
    layout: 'landing',
  },
  'Salão de Beleza': {
    primaryColor: '#8e44ad',
    secondaryColor: '#f1a1d0',
    accentColor: '#ffeeff',
    fontFamily: "'Lato', sans-serif",
    style: 'premium',
    layout: 'landing',
  },
  Estética: {
    primaryColor: '#7d5a9e',
    secondaryColor: '#f7d6e0',
    accentColor: '#fffafa',
    fontFamily: "'Nunito', sans-serif",
    style: 'minimal',
    layout: 'landing',
  },
  Mecânica: {
    primaryColor: '#2c3e50',
    secondaryColor: '#e74c3c',
    accentColor: '#f39c12',
    fontFamily: "'Roboto Condensed', sans-serif",
    style: 'bold',
    layout: 'landing',
  },
  Advocacia: {
    primaryColor: '#1a1a2e',
    secondaryColor: '#c9a84c',
    accentColor: '#f5f5f0',
    fontFamily: "'Playfair Display', serif",
    style: 'premium',
    layout: 'landing',
  },
  default: {
    primaryColor: '#15803d',
    secondaryColor: '#22c55e',
    accentColor: '#f0fdf4',
    fontFamily: "'Inter', sans-serif",
    style: 'modern',
    layout: 'landing',
  },
}

export function uiAgent(plan: SitePlan): AgentResult<SiteDesign> {
  try {
    const design =
      styleMap[plan.niche] ?? styleMap['default']

    // Se o planner já definiu cores, usa as cores dele
    if (plan.colorScheme?.primary) {
      design.primaryColor = plan.colorScheme.primary
      design.secondaryColor = plan.colorScheme.secondary
      design.style = (plan.colorScheme.style as SiteDesign['style']) ?? design.style
    }

    return { success: true, data: design }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
