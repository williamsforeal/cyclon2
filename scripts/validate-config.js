#!/usr/bin/env node

/**
 * Configuration Validation Script
 * ADHD-friendly: Clear checklist of what's configured and what's missing
 */

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check environment variables
 */
function checkEnvVariables() {
  log('\n🔍 Checking Environment Variables\n', 'cyan');

  const required = {
    'Airtable': [
      'AIRTABLE_API_KEY',
      'AIRTABLE_BASE_ID',
    ],
    'AWS S3': [
      'AWS_REGION',
      'S3_BUCKET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
    ],
    'OpenAI': [
      'OPENAI_API_KEY',
    ],
    'fal.ai': [
      'FAL_API_KEY',
    ],
  };

  const optional = {
    '11Labs (Optional)': [
      'ELEVENLABS_API_KEY',
    ],
    'n8n Cloud (Optional)': [
      'N8N_API_KEY',
      'N8N_API_URL',
    ],
  };

  let allValid = true;

  // Check required variables
  for (const [service, vars] of Object.entries(required)) {
    log(`${service}:`, 'cyan');
    for (const varName of vars) {
      const value = process.env[varName];
      if (value && value !== `your_${varName.toLowerCase()}_here`) {
        log(`  ✓ ${varName} is set`, 'green');
      } else {
        log(`  ✗ ${varName} is missing`, 'red');
        allValid = false;
      }
    }
    console.log();
  }

  // Check optional variables
  for (const [service, vars] of Object.entries(optional)) {
    log(`${service}:`, 'yellow');
    for (const varName of vars) {
      const value = process.env[varName];
      if (value && value !== `your_${varName.toLowerCase()}_here`) {
        log(`  ✓ ${varName} is set`, 'green');
      } else {
        log(`  ⚠ ${varName} is not set (optional)`, 'yellow');
      }
    }
    console.log();
  }

  return allValid;
}

/**
 * Check configuration files
 */
function checkConfigFiles() {
  log('🔍 Checking Configuration Files\n', 'cyan');

  const configDir = path.join(__dirname, '../config');
  const requiredFiles = [
    'airtable-schema.json',
    'prompts.json',
  ];

  let allValid = true;

  for (const file of requiredFiles) {
    const filepath = path.join(configDir, file);
    if (fs.existsSync(filepath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        log(`  ✓ ${file} is valid`, 'green');
      } catch (error) {
        log(`  ✗ ${file} has invalid JSON`, 'red');
        allValid = false;
      }
    } else {
      log(`  ✗ ${file} is missing`, 'red');
      allValid = false;
    }
  }

  console.log();
  return allValid;
}

/**
 * Check workflows
 */
function checkWorkflows() {
  log('🔍 Checking Workflows\n', 'cyan');

  const workflowsDir = path.join(__dirname, '../workflows');
  
  if (!fs.existsSync(workflowsDir)) {
    log('  ✗ Workflows directory not found', 'red');
    return false;
  }

  const workflowFiles = fs
    .readdirSync(workflowsDir)
    .filter((file) => file.endsWith('.json'));

  if (workflowFiles.length === 0) {
    log('  ⚠ No workflow files found', 'yellow');
    return true;
  }

  let allValid = true;

  for (const file of workflowFiles) {
    try {
      const filepath = path.join(workflowsDir, file);
      const workflow = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      log(`  ✓ ${workflow.name || file} is valid`, 'green');
    } catch (error) {
      log(`  ✗ ${file} has invalid JSON`, 'red');
      allValid = false;
    }
  }

  console.log();
  return allValid;
}

/**
 * Display setup instructions
 */
function showSetupInstructions(hasEnvIssues) {
  if (!hasEnvIssues) {
    log('✅ All configurations are valid!\n', 'green');
    return;
  }

  log('📋 Setup Instructions\n', 'cyan');
  log('To complete setup:', 'cyan');
  log('  1. Copy config/.env.example to .env', 'yellow');
  log('  2. Fill in your API keys and credentials', 'yellow');
  log('  3. Run this script again to validate\n', 'yellow');
  
  log('Getting API Keys:', 'cyan');
  log('  • Airtable: https://airtable.com/account', 'blue');
  log('  • AWS S3: https://console.aws.amazon.com/iam/', 'blue');
  log('  • OpenAI: https://platform.openai.com/api-keys', 'blue');
  log('  • fal.ai: https://fal.ai/dashboard', 'blue');
  log('  • 11Labs: https://elevenlabs.io/api (optional)', 'blue');
  log('  • n8n Cloud: https://app.n8n.cloud/settings (optional)\n', 'blue');
}

/**
 * Main validation function
 */
function validate() {
  log('\n🔧 Configuration Validator\n', 'cyan');

  const envValid = checkEnvVariables();
  const configValid = checkConfigFiles();
  const workflowsValid = checkWorkflows();

  const allValid = envValid && configValid && workflowsValid;

  showSetupInstructions(!envValid);

  if (allValid) {
    log('🎉 System is ready to use!\n', 'green');
    process.exit(0);
  } else {
    log('❌ Please fix the issues above\n', 'red');
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validate();
}

module.exports = { validate };
