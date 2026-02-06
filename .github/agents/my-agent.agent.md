Build a production n8n automation infrastructure for williamsforeal LLC - an AI-powered ad generation system for Shopify dropshipping.

CORE STRUCTURE:

1. WORKFLOWS DIRECTORY
/workflows/[category]-[function]-v[n].json
Categories: ad-generation, image-processing, airtable-ops, data-sync
Include workflow README template: purpose, inputs, outputs, API keys needed

2. CONFIGURATION
- .env.example: fal.ai, AWS S3, Airtable, OpenAI, 11Labs, Higgsfield, Kling AI keys
- /config/airtable-schemas.json: Actors, Scenes, Products, Ad Copy, B-Roll tables
- /config/api-endpoints.json: centralized API definitions
- /config/prompt-templates.json: reusable image/video generation prompts

3. UTILITIES (/utils/n8n-helpers/)
JavaScript functions for n8n Code nodes:
- S3 upload with retry logic
- Airtable batch operations (create/update/query)
- Image prompt variant generation (A/B/C)
- API response parsers (fal.ai, Higgsfield, Kling)
- Error handling wrappers for flaky APIs

4. CURRENT WORKFLOW (Static Scaler V2)
Airtable trigger → Merge data → Download product image → S3 upload (static-scaler-v2 bucket) → ChatGPT generates 3 prompt variants → fal.ai image-to-image (strength: 0.65) → Wait/Poll loop → Aggregate 3 images → Write to Airtable

Key challenge: Maintaining product accuracy (Palm Aura hand massager) while changing scenes using img2img with strength parameter

5. DATA SCHEMAS (/schemas)
TypeScript interfaces:
- AdCopyAnalysis: Angle, Avatar Target, Hook Type, CTA
- Actor: Name, Photo, Demographics, Generation Prompt
- Scene: Setting, Lighting, Props, Mood
- Product: Name, Image URL, Problem/Solution
- ImageVariant: Label, Emotional Promise, Prompt

6. SCRIPTS (/scripts)
- deploy-workflow.sh: Upload to n8n via API
- backup-workflows.sh: Export all workflows
- validate-airtable-schema.js: Field consistency checks
- test-api-connections.js: Health check all integrations

7. DOCUMENTATION
README: Architecture diagram, quickstart for n8n cloud (williamsforeal.app.n8n.cloud), dependency graph, troubleshooting
WORKFLOWS.md: Catalog of each workflow with descriptions
API-INTEGRATION.md: Auth patterns, rate limits, retry strategies

8. FUTURE EXPANSION
Modular structure for:
- Video workflows (Veo 3.1, Kling AI)
- UGC script generation
- Client templates (chatbots, lead qualification)
- Analytics dashboards

CONSTRAINTS:
- n8n cloud (no self-hosted Node.js)
- Reusable logic in JavaScript for Code nodes
- ADHD-friendly: clear structure, minimal cognitive load
- Solo operator but enterprise organization

TECH STACK:
Node.js, TypeScript, n8n workflows (JSON), AWS S3, Airtable, fal.ai/OpenAI/Higgsfield APIs

DELIVERABLES:
Complete file structure, documented README, example Static Scaler workflow JSON, utility functions with JSDoc, config templates, optional GitHub Actions for backups.

Make it production-ready with solo-operator simplicity.
