import mongoose, { Schema, Document } from 'mongoose'
import type { GeneratedSite } from '@/types'

export interface SiteDocument extends Omit<GeneratedSite, '_id'>, Document {}

const ServiceSchema = new Schema({
  name: String,
  description: String,
  icon: String,
})

const SiteSchema = new Schema<SiteDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true },
    city: { type: String, required: true },
    neighborhood: String,
    niche: String,
    whatsappLink: String,
    clientWhatsapp: String,
    deployUrl: String,
    monthlyPlan: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'error'],
      default: 'draft',
    },
    plan: {
      pages: [String],
      sections: [String],
      tone: String,
      keywords: [String],
      niche: String,
      colorScheme: {
        primary: String,
        secondary: String,
        style: String,
      },
    },
    content: {
      title: String,
      tagline: String,
      description: String,
      hero: {
        headline: String,
        subheadline: String,
        cta: String,
      },
      about: {
        title: String,
        text: String,
      },
      services: [ServiceSchema],
      contact: {
        cta: String,
        whatsappText: String,
      },
      seoMeta: {
        title: String,
        description: String,
        keywords: [String],
      },
    },
    design: {
      primaryColor: String,
      secondaryColor: String,
      accentColor: String,
      fontFamily: String,
      style: String,
      layout: String,
    },
  },
  {
    timestamps: true,
  }
)

export const Site =
  mongoose.models.Site || mongoose.model<SiteDocument>('Site', SiteSchema)
