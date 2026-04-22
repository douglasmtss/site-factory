# Banco de Dados

O Site Factory usa **MongoDB** como banco de dados, com **Mongoose** como ODM (Object Document Mapper).

---

## Conexão — `lib/mongodb.ts`

### Padrão Singleton para Next.js

O Next.js em modo de desenvolvimento faz hot reload frequente, o que pode criar múltiplas conexões ao MongoDB se não houver controle. A solução é armazenar a conexão no objeto `global`:

```typescript
// Declaração global para sobreviver ao hot reload
declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null }
}

export async function connectMongo() {
  // Reutiliza conexão existente
  if (global.mongooseCache.conn) return global.mongooseCache.conn

  // Reutiliza promise em andamento (evita conexões paralelas)
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    })
  }

  global.mongooseCache.conn = await global.mongooseCache.promise
  return global.mongooseCache.conn
}
```

### Uso

```typescript
import { connectMongo } from '@/lib/mongodb'

// Sempre chame antes de qualquer operação no banco
await connectMongo()
const sites = await Site.find({})
```

---

## Modelo — `models/Site.ts`

### Schema Completo

```typescript
const SiteSchema = new Schema({
  // Identificação
  slug: { type: String, required: true, unique: true, index: true },
  businessName: { type: String, required: true },
  city: { type: String, required: true },
  neighborhood: String,
  niche: String,

  // Links
  whatsappLink: String,
  clientWhatsapp: String,
  deployUrl: String,

  // Configurações
  monthlyPlan: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'error'],
    default: 'draft'
  },

  // Output do Planner
  plan: {
    pages: [String],
    sections: [String],
    tone: String,
    keywords: [String],
    niche: String,
    colorScheme: {
      primary: String,
      secondary: String
    }
  },

  // Output do Copywriter
  content: {
    title: String,
    tagline: String,
    description: String,
    hero: {
      headline: String,
      subheadline: String,
      cta: String
    },
    about: {
      title: String,
      text: String
    },
    services: [{
      name: String,
      description: String,
      icon: String
    }],
    contact: {
      whatsapp: String,
      whatsappText: String
    },
    seoMeta: {
      metaTitle: String,
      metaDescription: String
    }
  },

  // Output do UI Agent
  design: {
    primaryColor: String,
    secondaryColor: String,
    accentColor: String,
    fontFamily: String,
    style: String,
    layout: String
  }

}, { timestamps: true })  // adiciona createdAt e updatedAt automaticamente
```

### Registro do Model

```typescript
// Padrão Next.js — evita re-registro em hot reload
export const Site = mongoose.models.Site || mongoose.model<SiteDocument>('Site', SiteSchema)
```

---

## Documento de Exemplo

```json
{
  "_id": { "$oid": "66c8a1f2e4b0a12345678901" },
  "slug": "barbearia-do-joao-rio-de-janeiro-k2x9f",
  "businessName": "Barbearia do João",
  "city": "Rio de Janeiro",
  "neighborhood": "Copacabana",
  "niche": "Barbearia",
  "whatsappLink": "https://wa.me/5521999999999?text=Ol%C3%A1...",
  "clientWhatsapp": "5521999999999",
  "deployUrl": "https://sitefactory.com.br/s/barbearia-do-joao-rio-de-janeiro-k2x9f",
  "monthlyPlan": false,
  "status": "published",
  "plan": {
    "pages": ["home"],
    "sections": ["hero", "services", "about", "cta", "footer"],
    "tone": "confiante e masculino, direto ao ponto",
    "keywords": ["barbearia copacabana", "corte de cabelo rj"],
    "niche": "Barbearia",
    "colorScheme": { "primary": "#1a1a1a", "secondary": "#d4af37" }
  },
  "content": {
    "title": "Barbearia do João — Copacabana, Rio de Janeiro",
    "tagline": "Onde seu estilo encontra a precisão",
    "description": "A melhor barbearia de Copacabana...",
    "hero": {
      "headline": "Cortes que definem seu estilo em Copacabana",
      "subheadline": "Barbearia profissional com atendimento pelo WhatsApp",
      "cta": "Agendar pelo WhatsApp"
    },
    "about": {
      "title": "Sobre a Barbearia do João",
      "text": "Fundada em 2014, somos referência..."
    },
    "services": [
      { "name": "Corte Masculino", "description": "...", "icon": "✂️" },
      { "name": "Barba Completa", "description": "...", "icon": "🪒" }
    ],
    "contact": {
      "whatsapp": "21999999999",
      "whatsappText": "Olá! Quero agendar um horário na Barbearia do João"
    },
    "seoMeta": {
      "metaTitle": "Barbearia do João — Melhor Barbearia em Copacabana | RJ",
      "metaDescription": "Barbearia profissional em Copacabana. Agende pelo WhatsApp!"
    }
  },
  "design": {
    "primaryColor": "#1a1a1a",
    "secondaryColor": "#d4af37",
    "accentColor": "#f5f5f5",
    "fontFamily": "Inter",
    "style": "premium",
    "layout": "single-page"
  },
  "createdAt": { "$date": "2026-04-22T14:30:00.000Z" },
  "updatedAt": { "$date": "2026-04-22T14:30:00.000Z" }
}
```

---

## Queries Comuns

### Buscar por slug (para servir o site)
```typescript
const site = await Site.findOne({ slug })
if (!site) return notFound()
```

### Listar sites recentes (painel admin)
```typescript
const sites = await Site
  .find({})
  .select('slug businessName city niche status deployUrl createdAt whatsappLink')
  .sort({ createdAt: -1 })
  .limit(100)
```

### Contar por nicho
```typescript
const stats = await Site.aggregate([
  { $group: { _id: '$niche', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

### Buscar sites publicados
```typescript
const published = await Site.find({ status: 'published' }).countDocuments()
```

---

## Configuração do MongoDB

### Desenvolvimento Local

```bash
# Iniciar MongoDB local (Docker)
docker run -d -p 27017:27017 --name mongo-site-factory mongo:7

# Ou com MongoDB Compass, apontar para:
mongodb://localhost:27017/site-factory
```

### Variável de Ambiente

```env
# Local
MONGODB_URI=mongodb://localhost:27017/site-factory

# MongoDB Atlas (produção)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/site-factory?retryWrites=true&w=majority
```

### Índices Recomendados

O índice `slug` já é criado automaticamente pelo schema. Para produção, considere adicionar:

```javascript
// No MongoDB shell ou Compass
db.sites.createIndex({ createdAt: -1 })
db.sites.createIndex({ niche: 1, status: 1 })
db.sites.createIndex({ clientWhatsapp: 1 })
```

---

## Por que o HTML não é salvo no banco?

O `codeAgent` gera o HTML, mas ele **não é persistido** no MongoDB. Em vez disso, a rota `/s/[slug]/page.tsx` **reconstrói o HTML dinamicamente** a partir dos dados de `content` e `design`.

**Vantagens:**
- Documentos menores no banco (HTML pode ter 10–20KB)
- Permite atualizar o template de HTML sem re-gerar todos os sites
- Permite personalização futura por slug sem re-chamar a IA
