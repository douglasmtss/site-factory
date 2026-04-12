// Skill: Conversão
// Cria textos com foco em conversão: dor, solução, prova social, CTA

export interface ConversionInput {
  businessName: string
  niche: string
  city: string
  neighborhood?: string
  differentials?: string[]
}

export interface ConversionCopy {
  painPoint: string
  solution: string
  socialProof: string
  urgencyCta: string
  heroCta: string
  objectionHandler: Record<string, string>
}

const nicheConfigs: Record<string, ConversionCopy> = {
  barbearia: {
    painPoint: 'Cansado de esperar horas na fila da barbearia?',
    solution: 'Agende o seu horário em segundos direto pelo WhatsApp e seja atendido na hora marcada.',
    socialProof: 'Mais de 200 clientes satisfeitos na região.',
    urgencyCta: 'Agende agora — vagas limitadas!',
    heroCta: 'Quero agendar meu horário',
    objectionHandler: {
      preco: 'Qualidade premium por um preço justo. Sem surpresas.',
      distancia: 'Localização conveniente, perto de você.',
    },
  },
  restaurante: {
    painPoint: 'Quer comer bem sem precisar sair de casa ou perder tempo?',
    solution: 'Peça pelo WhatsApp e receba em casa com rapidez e qualidade.',
    socialProof: 'Centenas de pedidos entregues com satisfação garantida.',
    urgencyCta: 'Faça seu pedido agora!',
    heroCta: 'Pedir pelo WhatsApp',
    objectionHandler: {
      preco: 'Porções generosas pelo melhor preço da região.',
      tempo: 'Entrega rápida, sem enrolação.',
    },
  },
  estetica: {
    painPoint: 'Merece se cuidar sem complicação e sem agenda lotada.',
    solution: 'Agende seu procedimento de estética com profissionais especializados, diretamente pelo WhatsApp.',
    socialProof: 'Resultados reais para centenas de clientes satisfeitas.',
    urgencyCta: 'Agende sua consulta hoje!',
    heroCta: 'Quero agendar agora',
    objectionHandler: {
      preco: 'Investimento no seu bem-estar. Parcelas disponíveis.',
      confianca: 'Profissionais certificados e ambiente seguro.',
    },
  },
  mecanica: {
    painPoint: 'Carro com problema e não sabe onde confiar?',
    solution: 'Oficina especializada com diagnóstico rápido e orçamento honesto pelo WhatsApp.',
    socialProof: 'Mais de 500 carros atendidos na região.',
    urgencyCta: 'Solicite orçamento grátis agora!',
    heroCta: 'Quero orçamento grátis',
    objectionHandler: {
      preco: 'Orçamento grátis e preço justo. Sem surpresas na nota.',
      confianca: 'Mecânicos certificados com anos de experiência.',
    },
  },
  default: {
    painPoint: 'Precisa de atendimento profissional de qualidade?',
    solution: 'Entre em contato agora pelo WhatsApp e seja atendido rapidamente.',
    socialProof: 'Centenas de clientes satisfeitos na região.',
    urgencyCta: 'Entre em contato agora!',
    heroCta: 'Falar pelo WhatsApp',
    objectionHandler: {
      preco: 'Preço justo com qualidade garantida.',
      confianca: 'Profissionais experientes e comprometidos.',
    },
  },
}

export function getConversionCopy(niche: string): ConversionCopy {
  const normalized = niche.toLowerCase()
  for (const key of Object.keys(nicheConfigs)) {
    if (normalized.includes(key)) return nicheConfigs[key]
  }
  return nicheConfigs.default
}

export function buildConversionPromptInstructions(input: ConversionInput): string {
  const copy = getConversionCopy(input.niche)
  const differentials = input.differentials?.join(', ') ?? 'qualidade, rapidez e atendimento personalizado'

  return `
INSTRUÇÕES DE CONVERSÃO (copywriting de alta conversão):
- Comece abordando a DOR do cliente: "${copy.painPoint}"
- Apresente a SOLUÇÃO de forma clara
- Use PROVA SOCIAL para gerar confiança
- Termine SEMPRE com um CTA forte direcionando pro WhatsApp
- Diferenciais do negócio: ${differentials}
- Não venda "site". Venda "mais clientes" e "mais comodidade"
- Linguagem: direta, informal (mas profissional), focada em resultado
`.trim()
}

export function buildUrgencyBlock(niche: string): string {
  const copy = getConversionCopy(niche)
  return copy.urgencyCta
}
