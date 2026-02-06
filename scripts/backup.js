#!/usr/bin/env node

/**
 * Backup Script for Airtable Data and S3 Assets
 * ADHD-friendly: Simple backup with progress tracking
 */

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const axios = require('axios');

require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// Configuration
const BACKUP_DIR = path.join(__dirname, '../backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

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
 * Create backup directory
 */
function createBackupDir() {
  const backupPath = path.join(BACKUP_DIR, TIMESTAMP);
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  return backupPath;
}

/**
 * Backup Airtable data
 */
async function backupAirtable(backupPath) {
  log('📦 Backing up Airtable data...', 'cyan');

  const tables = [
    'Actors',
    'Scenes',
    'Products',
    'AdCopies',
    'AdVariants',
  ];

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    log('⚠ Airtable credentials not configured, skipping...', 'yellow');
    return;
  }

  for (const table of tables) {
    try {
      const response = await axios.get(
        `https://api.airtable.com/v0/${baseId}/${table}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const filename = path.join(backupPath, `airtable-${table.toLowerCase()}.json`);
      fs.writeFileSync(filename, JSON.stringify(response.data, null, 2));
      log(`  ✓ Backed up ${table} (${response.data.records.length} records)`, 'green');
    } catch (error) {
      log(`  ✗ Failed to backup ${table}: ${error.message}`, 'red');
    }
  }
}

/**
 * Backup S3 file list
 */
async function backupS3FileList(backupPath) {
  log('📦 Backing up S3 file list...', 'cyan');

  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    log('⚠ S3 credentials not configured, skipping...', 'yellow');
    return;
  }

  try {
    const s3 = new AWS.S3({
      region,
      accessKeyId,
      secretAccessKey,
    });

    const objects = await s3.listObjectsV2({ Bucket: bucket }).promise();
    
    const fileList = objects.Contents.map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));

    const filename = path.join(backupPath, 's3-file-list.json');
    fs.writeFileSync(filename, JSON.stringify(fileList, null, 2));
    log(`  ✓ Backed up S3 file list (${fileList.length} files)`, 'green');
  } catch (error) {
    log(`  ✗ Failed to backup S3 file list: ${error.message}`, 'red');
  }
}

/**
 * Backup configuration files
 */
function backupConfigs(backupPath) {
  log('📦 Backing up configuration files...', 'cyan');

  const configFiles = [
    'airtable-schema.json',
    'prompts.json',
  ];

  const configDir = path.join(__dirname, '../config');

  for (const file of configFiles) {
    try {
      const source = path.join(configDir, file);
      const dest = path.join(backupPath, `config-${file}`);
      
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        log(`  ✓ Backed up ${file}`, 'green');
      }
    } catch (error) {
      log(`  ✗ Failed to backup ${file}: ${error.message}`, 'red');
    }
  }
}

/**
 * Backup workflows
 */
function backupWorkflows(backupPath) {
  log('📦 Backing up workflows...', 'cyan');

  const workflowsDir = path.join(__dirname, '../workflows');
  const workflowFiles = fs
    .readdirSync(workflowsDir)
    .filter((file) => file.endsWith('.json'));

  for (const file of workflowFiles) {
    try {
      const source = path.join(workflowsDir, file);
      const dest = path.join(backupPath, `workflow-${file}`);
      fs.copyFileSync(source, dest);
      log(`  ✓ Backed up ${file}`, 'green');
    } catch (error) {
      log(`  ✗ Failed to backup ${file}: ${error.message}`, 'red');
    }
  }
}

/**
 * Main backup function
 */
async function backup() {
  log('\n💾 Starting Backup Process\n', 'cyan');

  try {
    const backupPath = createBackupDir();
    log(`📁 Backup location: ${backupPath}\n`, 'cyan');

    await backupAirtable(backupPath);
    console.log();

    await backupS3FileList(backupPath);
    console.log();

    backupConfigs(backupPath);
    console.log();

    backupWorkflows(backupPath);
    console.log();

    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      backupPath,
      version: '1.0.0',
    };
    fs.writeFileSync(
      path.join(backupPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    log('✅ Backup completed successfully!', 'green');
    log(`📁 Backup saved to: ${backupPath}\n`, 'cyan');
  } catch (error) {
    log(`❌ Backup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run backup
if (require.main === module) {
  backup();
}

module.exports = { backup };
