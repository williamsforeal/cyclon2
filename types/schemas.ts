/**
 * TypeScript Schemas for AI Ad Generation Pipeline
 * ADHD-friendly: Clear interfaces with descriptive comments
 */

/**
 * Actor - The person/character featured in the ad
 */
export interface Actor {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  voiceId?: string; // 11Labs voice ID
  tags: string[];
  metadata?: Record<string, any>;
}

/**
 * Scene - The setting/environment for the ad
 */
export interface Scene {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Base scene image
  style: string; // e.g., "professional", "casual", "dramatic"
  tags: string[];
  metadata?: Record<string, any>;
}

/**
 * Product - The item being advertised
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  price?: number;
  category: string;
  features: string[];
  targetAudience: string[];
  metadata?: Record<string, any>;
}

/**
 * AdCopy - The text content for the ad
 */
export interface AdCopy {
  id: string;
  productId: string;
  headline: string;
  body: string;
  callToAction: string;
  tone: 'professional' | 'casual' | 'humorous' | 'urgent' | 'inspirational';
  length: 'short' | 'medium' | 'long';
  variantNumber?: number; // 1, 2, or 3 for the 3 variants
  generatedAt?: string;
  metadata?: Record<string, any>;
}

/**
 * AdVariant - Complete ad with all components
 */
export interface AdVariant {
  id: string;
  productId: string;
  actorId: string;
  sceneId: string;
  adCopyId: string;
  generatedImageUrl?: string; // fal.ai output
  status: 'pending' | 'generating' | 'complete' | 'failed';
  variantNumber: number; // 1, 2, or 3
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Pipeline Configuration for n8n workflow
 */
export interface PipelineConfig {
  fal: {
    apiKey: string;
    model: string;
    strength: number; // Default: 0.65
  };
  openai: {
    apiKey: string;
    model: string; // e.g., "gpt-4"
  };
  elevenlabs: {
    apiKey: string;
  };
  airtable: {
    apiKey: string;
    baseId: string;
    tables: {
      actors: string;
      scenes: string;
      products: string;
      adCopies: string;
      adVariants: string;
    };
  };
  s3: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * Error with retry information
 */
export interface RetryableError {
  message: string;
  attempt: number;
  maxRetries: number;
  canRetry: boolean;
}
