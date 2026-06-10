const serverless = require('serverless-http');
const path = require('path');

try { require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') }); } catch(e) {}

const app = require('../../backend/src/app');

exports.handler = serverless(app);
