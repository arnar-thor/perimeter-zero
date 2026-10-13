// Shared test settings. Override with environment variables.
const path = require('path'); const os = require('os');
const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.PZ_BASE || 'http://localhost:8611/';
module.exports = {
  ROOT, BASE, ORIGIN: new URL(BASE).origin,
  CHROME: process.env.CHROME_PATH || '/usr/bin/google-chrome',
  OUT: process.env.PZ_OUT || path.join(__dirname, 'output'),
  ELECTRON_EXE: process.env.PZ_ELECTRON || path.join(ROOT, 'mac', 'out', 'Perimeter Zero-linux-x64', 'perimeter-zero'),
  TMP: os.tmpdir(),
};
