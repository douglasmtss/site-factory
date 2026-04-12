// Skill: WhatsApp CTA
// Gera links e textos de CTA para WhatsApp

export interface WhatsAppInput {
  number: string           // número com DDI, ex: 5521999999999
  businessName: string
  niche: string
  context?: 'agenda' | 'pedido' | 'orcamento' | 'contato'
}

const contextMessages: Record<string, string> = {
  agenda: 'Olá! Gostaria de agendar um horário.',
  pedido: 'Olá! Quero fazer um pedido.',
  orcamento: 'Olá! Gostaria de um orçamento.',
  contato: 'Olá! Vim pelo site e gostaria de mais informações.',
}

export function buildWhatsAppLink(input: WhatsAppInput): string {
  const { number, context = 'contato', businessName } = input

  // Sanitiza o número: remove tudo que não é dígito
  const sanitizedNumber = number.replace(/\D/g, '')

  const message = contextMessages[context] || contextMessages.contato
  const fullMessage = `${message} (${businessName})`

  const encoded = encodeURIComponent(fullMessage)
  return `https://wa.me/${sanitizedNumber}?text=${encoded}`
}

export function buildWhatsAppButton(input: WhatsAppInput, label?: string): {
  href: string
  label: string
  ariaLabel: string
} {
  const labelMap: Record<string, string> = {
    agenda: '📅 Agendar pelo WhatsApp',
    pedido: '🛒 Fazer pedido pelo WhatsApp',
    orcamento: '💬 Solicitar orçamento',
    contato: '💬 Falar pelo WhatsApp',
  }

  const context = input.context ?? 'contato'

  return {
    href: buildWhatsAppLink(input),
    label: label ?? labelMap[context] ?? '💬 Falar pelo WhatsApp',
    ariaLabel: `Contatar ${input.businessName} pelo WhatsApp`,
  }
}

export function buildCtaSection(input: WhatsAppInput): {
  headline: string
  subheadline: string
  buttonLabel: string
  link: string
} {
  const { businessName, niche } = input

  return {
    headline: `Pronto para ser atendido em ${businessName}?`,
    subheadline: `Entre em contato agora pelo WhatsApp e garanta seu atendimento de ${niche}. Rápido, simples e sem complicação.`,
    buttonLabel: '💬 Falar pelo WhatsApp agora',
    link: buildWhatsAppLink(input),
  }
}

export function buildFloatingWhatsApp(number: string): { number: string; link: string } {
  const sanitized = number.replace(/\D/g, '')
  return {
    number: sanitized,
    link: `https://wa.me/${sanitized}`,
  }
}
