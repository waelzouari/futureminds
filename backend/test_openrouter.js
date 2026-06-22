const https = require('https');

const apiKey = process.env.OPENROUTER_API_KEY || 'YOUR_OPENROUTER_API_KEY';
const MODEL = 'google/gemini-2.5-flash';

const data = JSON.stringify({
  model: MODEL,
  messages: [
    { role: 'user', content: 'Say hello in one word.' }
  ],
  max_tokens: 1000
});

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (d) => {
    responseBody += d;
  });

  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', responseBody);
  });
});

req.on('error', (e) => {
  console.error('ERROR:', e.message);
});

req.write(data);
req.end();
