const https = require('https');
const fs = require('fs');
const path = require('path');
const home = process.env.USERPROFILE;
const configPath = path.join(home, '.netlify', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = config.accessTokens && Object.values(config.accessTokens)[0];

if (!token) { console.error('No Netlify token found'); process.exit(1); }

const body = JSON.stringify({ name: 'yaro-store' });
const opts = {
  hostname: 'api.netlify.com',
  path: '/api/v1/sites',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }
};
const req = https.request(opts, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('HTTP', res.statusCode);
    const parsed = JSON.parse(data);
    console.log('URL:', parsed.ssl_url || parsed.url);
    console.log('ID:', parsed.id);
    console.log('Site name:', parsed.name);
    // Save site info so we can link it
    fs.writeFileSync(path.join(__dirname, '..', '.netlify', 'state.json'), JSON.stringify({
      siteId: parsed.id
    }, null, 2));
  });
});
req.on('error', console.error);
req.write(body);
req.end();
