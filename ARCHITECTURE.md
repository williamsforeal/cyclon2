# 🔄 Pipeline Architecture

## Overview

The AI Ad Generation Pipeline is a serverless, event-driven automation that transforms product data into complete ad variants with AI-generated copy and images.

## Data Flow

```
┌─────────────┐
│  Airtable   │ (Data Source)
│  Database   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Pending Variants│ (Status: "pending")
│  - Product ID   │
│  - Actor ID     │
│  - Scene ID     │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │  n8n   │ (Orchestrator)
    │Workflow│
    └───┬────┘
        │
        ├─────────────────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   Fetch      │      │   Upload     │
│   Product    │      │   Images     │
│   Actor      │      │   to S3      │
│   Scene      │      │              │
└──────┬───────┘      └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
                  ▼
          ┌──────────────┐
          │   ChatGPT    │ (AI Copy Generation)
          │   Generate   │
          │   Ad Copy    │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │   fal.ai     │ (AI Image Generation)
          │   img2img    │
          │   (×3 vars)  │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │   Upload     │
          │   Results    │
          │   to S3      │
          └──────┬───────┘
                 │
                 ▼
          ┌──────────────┐
          │   Update     │
          │   Airtable   │
          │ (Status:     │
          │  "complete") │
          └──────────────┘
```

## Components

### 1. Airtable (Database)
- **Purpose**: Central data store
- **Tables**: Actors, Scenes, Products, AdCopies, AdVariants
- **Trigger**: AdVariants with status="pending"

### 2. n8n Workflow (Orchestrator)
- **Purpose**: Coordinate API calls and data flow
- **Trigger**: Schedule (hourly) or webhook
- **Error Handling**: Retries with exponential backoff

### 3. AWS S3 (Storage)
- **Purpose**: Store generated images
- **Structure**: `ads/{variantId}_variant_{1,2,3}.png`
- **Access**: Public URLs returned to Airtable

### 4. OpenAI ChatGPT (Copy Generation)
- **Purpose**: Generate ad headlines, body, CTA
- **Model**: GPT-4
- **Input**: Product description, actor profile, scene details
- **Output**: Structured ad copy (headline, body, CTA)

### 5. fal.ai (Image Generation)
- **Purpose**: Create 3 image variants
- **Model**: fast-sdxl img2img
- **Strength**: 0.65 (balance between input & AI)
- **Input**: Base actor image + ChatGPT copy as prompt
- **Output**: 3 unique image variants

### 6. 11Labs (Optional - Voice)
- **Purpose**: Generate voice-overs
- **Input**: Ad copy + voice ID
- **Output**: Audio file (uploaded to S3)

## Process Flow

### Step 1: Trigger (0s)
```
n8n Schedule Trigger fires
→ Queries Airtable for pending variants
```

### Step 2: Data Gathering (1-2s)
```
For each pending variant:
  → Fetch Product details
  → Fetch Actor details
  → Fetch Scene details
  → Upload actor image to S3 (if needed)
```

### Step 3: AI Copy Generation (3-5s)
```
Send to ChatGPT:
  Product: {name, description, features}
  Actor: {name, description}
  Scene: {name, description, style}

Receive:
  {
    "headline": "...",
    "body": "...",
    "callToAction": "..."
  }
```

### Step 4: AI Image Generation (15-30s per variant)
```
For variant 1, 2, 3:
  Send to fal.ai:
    - Base image: Actor photo
    - Prompt: Generated ad copy
    - Strength: 0.65
    
  Receive:
    - Generated image URL
    
  Upload to S3:
    - Key: ads/{variantId}_variant_{n}.png
```

### Step 5: Write Back (1-2s)
```
Update Airtable AdVariant:
  - status: "complete"
  - generatedImageUrl: S3 URL
  - updatedAt: timestamp
```

**Total Time per Ad**: ~60-90 seconds for 3 variants

## Error Handling

### Retry Strategy
```typescript
{
  maxRetries: 3,
  initialDelay: 1000ms,
  backoffMultiplier: 2,
  maxDelay: 30000ms
}
```

### Retryable Errors
- Network timeouts
- Rate limits (429, 503, 504)
- Connection resets
- Temporary API failures

### Non-Retryable Errors
- Invalid API keys (401)
- Bad requests (400)
- Not found (404)
- Out of quota

### Failure Recovery
```
If error after retries:
  → Update AdVariant status to "failed"
  → Log error details to metadata
  → Continue with next variant
  → Send notification (if configured)
```

## Scaling Considerations

### Current Limits
- **Airtable**: 5 requests/second
- **OpenAI**: 3,500 requests/minute (tier 1)
- **fal.ai**: Varies by plan
- **S3**: Unlimited (but costs apply)

### Batch Processing
```typescript
// Process 5 variants at a time
processBatch(variants, processVariant, {
  batchSize: 5,
  retryOptions: { maxRetries: 3 },
  onProgress: (done, total) => {
    console.log(`${done}/${total} variants processed`);
  }
});
```

### Cost Estimates (per 100 ads)
- **OpenAI GPT-4**: ~$0.50 (copy generation)
- **fal.ai**: ~$5.00 (300 images @ $0.017/image)
- **S3**: ~$0.02 (storage + transfer)
- **Total**: ~$5.52 per 100 ads (300 variants)

## Performance Optimization

### 1. Caching
- Cache actor/scene images in S3
- Reuse uploaded images across variants
- Cache Airtable records for 5 minutes

### 2. Parallel Processing
- Generate copy for multiple variants simultaneously
- Upload images to S3 in parallel
- Batch Airtable updates

### 3. Image Optimization
- Compress images before upload (WebP format)
- Use CDN for S3 (CloudFront)
- Generate thumbnails for previews

## Monitoring

### Key Metrics
- Variants processed per hour
- Average processing time
- Error rate by API
- Cost per variant
- Success rate

### Health Checks
```bash
# Check pending queue
npm run validate

# View recent backups
ls -la backups/

# Test API connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## Security

### API Keys
- Stored in environment variables
- Never committed to Git
- Rotated every 90 days
- Least-privilege access

### S3 Bucket
- Private by default
- Public read for generated images only
- CORS configured for n8n access
- Lifecycle rules for cleanup

### Airtable
- Separate API keys per environment
- Field-level permissions
- Audit log enabled
- Backup daily

## Deployment

### Development
```bash
# Local testing with sample data
npm run dev
npm run validate
```

### Production
```bash
# Deploy to n8n Cloud
npm run deploy

# Set up monitoring
npm run backup  # Cron: daily at 2am

# Enable auto-scaling (if needed)
# Configure n8n workflow settings
```

## Maintenance

### Daily
- Check error logs in n8n
- Verify backup completed
- Monitor API usage

### Weekly
- Review generated ads quality
- Analyze cost trends
- Update prompts if needed

### Monthly
- Rotate API keys
- Clean up old S3 files
- Update dependencies
- Review and optimize costs
