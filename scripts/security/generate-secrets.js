#!/usr/bin/env node

/**
 * Generate secure secrets for Eazepay deployment
 * Usage: node scripts/security/generate-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate secure random string
function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

// Generate API key
function generateApiKey() {
  return 'ak_' + crypto.randomBytes(32).toString('base64').replace(/[+/=]/g, '');
}

// Generate encryption key
function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate password
function generatePassword(length = 32) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  return password;
}

console.log('🔐 Generating secure secrets for Eazepay...\n');

const secrets = {
  JWT_SECRET: generateSecret(64),
  INTERNAL_API_KEY: generateApiKey(),
  DB_PASSWORD: generatePassword(32),
  REDIS_PASSWORD: generatePassword(32),
  MONGODB_PASSWORD: generatePassword(32),
  ENCRYPTION_KEY: generateEncryptionKey(),
  SESSION_SECRET: generateSecret(32),
  API_KEY_1: generateApiKey(),
  API_KEY_2: generateApiKey(),
  API_KEY_3: generateApiKey()
};

console.log('Generated Secrets:');
console.log('==================\n');

for (const [key, value] of Object.entries(secrets)) {
  console.log(`${key}=${value}`);
}

console.log('\n==================\n');
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Store these secrets in a secure secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)');
console.log('2. NEVER commit these secrets to version control');
console.log('3. Rotate secrets regularly (every 30-90 days)');
console.log('4. Use different secrets for each environment (dev, staging, production)');
console.log('5. Limit access to secrets to only necessary personnel\n');

// Optionally save to file (for development only)
const saveToFile = process.argv.includes('--save');
if (saveToFile) {
  const outputPath = path.join(__dirname, '../../.env.generated');
  const envContent = Object.entries(secrets)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(outputPath, envContent);
  console.log(`✅ Secrets saved to ${outputPath}`);
  console.log('⚠️  Remember to move these to your secrets manager and delete this file!\n');
}

// Generate AWS Secrets Manager commands
console.log('AWS Secrets Manager Commands:');
console.log('=============================\n');
for (const [key, value] of Object.entries(secrets)) {
  console.log(`aws secretsmanager create-secret --name eazepay/${key} --secret-string "${value}"`);
}

console.log('\n');

// Generate Azure Key Vault commands
console.log('Azure Key Vault Commands:');
console.log('=========================\n');
for (const [key, value] of Object.entries(secrets)) {
  console.log(`az keyvault secret set --vault-name eazepay-vault --name ${key} --value "${value}"`);
}

console.log('\n');

// Generate GCP Secret Manager commands
console.log('GCP Secret Manager Commands:');
console.log('============================\n');
for (const [key, value] of Object.entries(secrets)) {
  console.log(`echo -n "${value}" | gcloud secrets create ${key} --data-file=-`);
}

console.log('\n✅ Secret generation complete!\n');
