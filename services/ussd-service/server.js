const fs = require('fs');
const path = require('path');
const app = require('./index');

const envPath = path.resolve(__dirname, '.env');

try {
  const envContents = fs.readFileSync(envPath, 'utf8');
  envContents.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && value && !Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  });
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.warn(`Failed to load .env file: ${error.message}`);
  }
}

const PORT = process.env.PORT || 8004;
app.listen(PORT, () => {
  console.log(`USSD Service running on port ${PORT}`);
});
