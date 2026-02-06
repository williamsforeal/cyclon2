#!/usr/bin/env node

/**
 * Deploy Script for n8n Workflows
 * ADHD-friendly: Step-by-step deployment with clear feedback
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuration
const N8N_API_URL = process.env.N8N_API_URL || 'https://app.n8n.cloud/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;
const WORKFLOWS_DIR = path.join(__dirname, '../workflows');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

/**
 * Check if required environment variables are set
 */
function validateEnvironment() {
  logStep('1/4', 'Validating environment...');

  if (!N8N_API_KEY) {
    logError('N8N_API_KEY is not set in environment variables');
    logWarning('Please set N8N_API_KEY in your .env file');
    process.exit(1);
  }

  if (!fs.existsSync(WORKFLOWS_DIR)) {
    logError(`Workflows directory not found: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  logSuccess('Environment validated');
}

/**
 * Get list of workflow files
 */
function getWorkflowFiles() {
  logStep('2/4', 'Finding workflow files...');

  const files = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((file) => file.endsWith('.json'));

  if (files.length === 0) {
    logWarning('No workflow JSON files found');
    process.exit(0);
  }

  logSuccess(`Found ${files.length} workflow file(s)`);
  return files;
}

/**
 * Deploy a single workflow
 */
async function deployWorkflow(filename) {
  const filepath = path.join(WORKFLOWS_DIR, filename);
  const workflow = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  log(`  → Deploying ${workflow.name || filename}...`, 'blue');

  // Note: This is a placeholder for actual n8n API deployment
  // In practice, you would make HTTP requests to n8n API
  // For n8n cloud, workflows are typically imported via UI or CLI
  
  logSuccess(`  ${filename} prepared for deployment`);
  logWarning(`  Manual step: Import this workflow to n8n cloud via UI`);
  
  return true;
}

/**
 * Main deployment function
 */
async function deploy() {
  log('\n🚀 n8n Workflow Deployment\n', 'cyan');

  try {
    // Step 1: Validate environment
    validateEnvironment();

    // Step 2: Get workflow files
    const workflowFiles = getWorkflowFiles();

    // Step 3: Deploy workflows
    logStep('3/4', 'Deploying workflows...');
    
    for (const file of workflowFiles) {
      await deployWorkflow(file);
    }

    // Step 4: Summary
    logStep('4/4', 'Deployment complete!');
    log('\n📋 Next Steps:', 'cyan');
    log('  1. Go to n8n cloud: https://app.n8n.cloud', 'blue');
    log('  2. Click "Import" in the workflows section', 'blue');
    log('  3. Upload the workflow JSON files from /workflows directory', 'blue');
    log('  4. Configure credentials for:', 'blue');
    log('     - Airtable API', 'blue');
    log('     - AWS S3', 'blue');
    log('     - OpenAI API', 'blue');
    log('     - fal.ai API', 'blue');
    log('  5. Activate the workflows\n', 'blue');

    logSuccess('All workflows ready for import!');
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deploy();
}

module.exports = { deploy };
