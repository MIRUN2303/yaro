const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SUPABASE_MGMT_TOKEN || process.env.SUPABASE_SERVICE_KEY;
const REF = process.env.SUPABASE_REF;

if (!TOKEN || !REF) {
  console.error('Usage: SUPABASE_REF=<project-ref> SUPABASE_MGMT_TOKEN=<sbp_token> node scripts/migrate.js');
  console.error('Or set SUPABASE_SERVICE_KEY and SUPABASE_REF in .env');
  process.exit(1);
}

function query(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: 'api.supabase.com',
      path: '/v1/projects/' + REF + '/database/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TOKEN
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error('HTTP ' + res.statusCode + ': ' + (data.substring(0, 300) || 'unknown')));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  const files = [
    { name: '001_initial.sql', dir: path.join(__dirname, '..', 'src', 'migrations') },
    { name: '002_homepage_settings.sql', dir: path.join(__dirname, '..', 'migrations') }
  ];

  for (const file of files) {
    const filePath = path.join(file.dir, file.name);
    if (!fs.existsSync(filePath)) {
      console.log('Skipping', file.name, '(not found)');
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('Running', file.name + '...');
    try {
      await query(sql);
      console.log('  OK');
    } catch (e) {
      console.error('  FAILED:', e.message);
      process.exit(1);
    }
  }

  console.log('\nAll migrations complete!');
}

run().catch(console.error);
