# 📌 Quick Reference

> **Cheat sheet for common tasks**

## 🚀 Setup Commands

```bash
# Initial setup
npm install
cp .env.example .env
# Edit .env with your keys
npm run validate

# Deploy to n8n
npm run deploy
```

## 🔧 Development Commands

```bash
# Build TypeScript
npm run build

# Watch mode (auto-rebuild)
npm run dev

# Validate configuration
npm run validate
```

## 💾 Maintenance Commands

```bash
# Backup data
npm run backup

# View backups
ls -la backups/
```

## 📊 Common Tasks

### Add New Actor
1. Go to Airtable → Actors table
2. Click "+ Add record"
3. Fill in:
   - name: "John Doe"
   - imageUrl: "https://..."
   - description: "Professional actor..."
   - tags: "male, professional, 30s"

### Add New Product
1. Go to Airtable → Products table
2. Click "+ Add record"
3. Fill in:
   - name: "Product Name"
   - description: "Full description..."
   - category: "Electronics"
   - features: "Feature 1, Feature 2, Feature 3"
   - targetAudience: "Tech enthusiasts"

### Create Ad Variant
1. Go to Airtable → AdVariants table
2. Click "+ Add record"
3. Fill in:
   - productId: (select from dropdown)
   - actorId: (select from dropdown)
   - sceneId: (select from dropdown)
   - status: "pending"
   - variantNumber: 1 (or 2, 3)
   - createdAt: (today's date)
   - updatedAt: (today's date)
4. n8n will process automatically

### Check Results
1. Go to Airtable → AdVariants table
2. Look for status: "complete"
3. Click on generatedImageUrl to view
4. Or check S3 bucket: `s3://{bucket}/ads/`

## 🔍 Debugging

### Check n8n Logs
1. Go to https://app.n8n.cloud
2. Click on workflow
3. View "Executions" tab
4. Click on specific execution to see details

### Test API Connections

```bash
# Test Airtable
curl -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  "https://api.airtable.com/v0/$AIRTABLE_BASE_ID/Actors"

# Test OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Test S3
aws s3 ls s3://$S3_BUCKET --region $AWS_REGION

# Test fal.ai
curl -H "Authorization: Key $FAL_API_KEY" \
  https://fal.run/fal-ai/fast-sdxl/status
```

## 📝 File Locations

```
Config:           config/.env.example
Workflows:        workflows/*.json
Scripts:          scripts/*.js
Utilities:        utils/**/*.ts
Types:            types/schemas.ts
Backups:          backups/YYYY-MM-DD/
Built files:      dist/
```

## 🎯 n8n Workflow Nodes

| Node | Purpose | Config Needed |
|------|---------|---------------|
| Schedule Trigger | Start workflow | Schedule (e.g., hourly) |
| Airtable | Read/write data | API key, Base ID |
| HTTP Request (OpenAI) | Generate ad copy | API key |
| HTTP Request (fal.ai) | Generate images | API key |
| S3 | Upload images | Access keys |

## 🔐 Environment Variables

### Required
```bash
AIRTABLE_API_KEY=patXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXX
AWS_REGION=us-east-1
S3_BUCKET=my-bucket
AWS_ACCESS_KEY_ID=AKIAXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxx
FAL_API_KEY=xxxxxxxx
```

### Optional
```bash
ELEVENLABS_API_KEY=xxxxxxxx
N8N_API_KEY=xxxxxxxx
```

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| "Missing API key" | Check .env file, run `npm run validate` |
| "Airtable 401" | Regenerate API key |
| "S3 403" | Check bucket permissions |
| "OpenAI rate limit" | Wait 60s or upgrade tier |
| "fal.ai timeout" | Images take 15-30s, increase timeout |

## 💡 Tips

### ADHD-Friendly Workflow
1. **One task at a time**: Focus on single ad variant
2. **Visual feedback**: Check Airtable status colors
3. **Quick wins**: Start with 1 actor, 1 scene, 1 product
4. **Automate backups**: Set cron for daily backups
5. **Monitor costs**: Check API usage weekly

### Cost Optimization
- Reuse actor images (cache in S3)
- Batch process during off-peak
- Use GPT-3.5 instead of GPT-4 for drafts
- Set max variants per run limit
- Archive old variants monthly

### Quality Improvement
- Test different img2img strength values (0.5-0.8)
- Refine prompts in `config/prompts.json`
- A/B test different tones
- Collect feedback in Airtable
- Review and iterate weekly

## 🔗 Quick Links

- [Airtable Dashboard](https://airtable.com)
- [n8n Cloud](https://app.n8n.cloud)
- [AWS S3 Console](https://s3.console.aws.amazon.com)
- [OpenAI Usage](https://platform.openai.com/usage)
- [fal.ai Dashboard](https://fal.ai/dashboard)

## 📞 Getting Help

1. Check README.md (detailed docs)
2. Check SETUP.md (step-by-step guide)
3. Check ARCHITECTURE.md (system design)
4. Run `npm run validate` (diagnose issues)
5. Check n8n execution logs
6. Review this quick reference

## 🎓 Learning Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Airtable API](https://airtable.com/developers/web/api/introduction)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [fal.ai Models](https://fal.ai/models)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: 2026-02-06
**Version**: 1.0.0
