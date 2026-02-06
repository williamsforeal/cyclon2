# 🚀 Quick Setup Guide

> **Goal**: Get your AI ad generation pipeline running in 15 minutes

## ✅ Checklist

- [ ] Install Node.js (v16+)
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Get API keys
- [ ] Configure environment
- [ ] Set up Airtable
- [ ] Import n8n workflow
- [ ] Test the pipeline

## Step 1: Prerequisites (2 min)

```bash
# Check Node.js version (needs v16+)
node --version

# Clone the repo
git clone https://github.com/williamsforeal/cyclon2.git
cd cyclon2

# Install dependencies
npm install
```

## Step 2: Get API Keys (5 min)

Open these links and sign up / get API keys:

1. **Airtable** → https://airtable.com/account
   - Click "Generate API key"
   - Save the key

2. **AWS S3** → https://console.aws.amazon.com/iam/
   - Create new IAM user
   - Attach `AmazonS3FullAccess` policy
   - Generate access keys
   - Create S3 bucket

3. **OpenAI** → https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Save the key

4. **fal.ai** → https://fal.ai/dashboard
   - Sign up / Login
   - Go to API Keys
   - Generate new key

5. **11Labs** (Optional) → https://elevenlabs.io/api
   - For voice generation

## Step 3: Configure (2 min)

```bash
# Copy example config
cp .env.example .env

# Edit with your keys
nano .env
# or
code .env
```

Fill in these required fields:
```
AIRTABLE_API_KEY=patXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXX
S3_BUCKET=my-ads-bucket
AWS_ACCESS_KEY_ID=AKIAXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxx
FAL_API_KEY=xxxxxxxx
```

## Step 4: Validate Setup (1 min)

```bash
npm run validate
```

Should show all green checkmarks ✅

## Step 5: Set Up Airtable (3 min)

1. Go to https://airtable.com
2. Create new base called "AI Ad Generation"
3. Create 5 tables:

### Table: Actors
| Field | Type | Required |
|-------|------|----------|
| name | Single line text | Yes |
| imageUrl | URL | Yes |
| description | Long text | No |
| voiceId | Single line text | No |
| tags | Multiple select | No |

### Table: Scenes
| Field | Type | Required |
|-------|------|----------|
| name | Single line text | Yes |
| description | Long text | Yes |
| style | Single select | Yes |
| imageUrl | URL | No |
| tags | Multiple select | No |

### Table: Products
| Field | Type | Required |
|-------|------|----------|
| name | Single line text | Yes |
| description | Long text | Yes |
| category | Single select | Yes |
| price | Number | No |
| features | Long text | No |
| imageUrl | URL | No |

### Table: AdCopies
| Field | Type | Required |
|-------|------|----------|
| productId | Link to Products | Yes |
| headline | Single line text | Yes |
| body | Long text | Yes |
| callToAction | Single line text | Yes |
| tone | Single select | Yes |
| variantNumber | Number | No |

### Table: AdVariants
| Field | Type | Required |
|-------|------|----------|
| productId | Link to Products | Yes |
| actorId | Link to Actors | Yes |
| sceneId | Link to Scenes | Yes |
| status | Single select | Yes |
| variantNumber | Number | Yes |
| generatedImageUrl | URL | No |
| createdAt | Date | Yes |
| updatedAt | Date | Yes |

**Status options**: pending, generating, complete, failed

4. Add sample data:
   - 1-2 Actors
   - 1-2 Scenes
   - 1 Product
   - 1 AdVariant with status="pending"

## Step 6: Import to n8n (2 min)

```bash
npm run deploy
```

Then:
1. Go to https://app.n8n.cloud
2. Click **Workflows** → **Import**
3. Upload `workflows/ai-ad-generation-pipeline.json`
4. Configure credentials:
   - **Airtable**: Paste your API key
   - **AWS S3**: Enter access key & secret
   - **OpenAI**: Paste your API key
   - **fal.ai**: Use HTTP Request node with Authorization: `Key YOUR_KEY`

## Step 7: Test! 🎉

1. In n8n workflow, click **Execute Workflow**
2. Check the execution log
3. Verify:
   - Airtable reads pending variants ✅
   - ChatGPT generates ad copy ✅
   - fal.ai creates images ✅
   - Images uploaded to S3 ✅
   - Airtable updated with results ✅

## 🎊 You're Done!

Your pipeline is now running. The workflow will:
- Check Airtable every hour (or on your schedule)
- Process pending ad variants
- Generate 3 image variants per ad
- Save everything back to Airtable

## 🐛 Common Issues

### "Missing API key"
- Double-check `.env` file
- Make sure no spaces around `=`
- Keys should not have quotes

### "Airtable error"
- Verify base ID is correct
- Check table names match exactly
- Ensure API key has access to base

### "S3 upload failed"
- Check bucket name
- Verify AWS credentials
- Ensure bucket region matches `AWS_REGION`

### "n8n workflow error"
- Check all credentials are set
- Verify environment variables in n8n
- Test each node individually

## 📞 Need Help?

- Check main README.md for detailed docs
- Run `npm run validate` to diagnose issues
- Check the troubleshooting section in README.md

## 🎯 Next Steps

- Add more actors, scenes, and products
- Customize prompts in `config/prompts.json`
- Set up automated backups: `npm run backup`
- Configure 11Labs for voice generation
- Scale up with batch processing
