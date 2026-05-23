const http = require('http');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Generate a fake admin token
const token = jwt.sign({ id: '6a0a12e36db7c5ec50ccfb51' }, process.env.JWT_SECRET || 'yoursecretkey', { expiresIn: '1h' });

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    'Authorization': `Bearer ${token}`
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write('------WebKitFormBoundary7MA4YWxkTrZu0gW\r\n');
req.write('Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n');
req.write('Content-Type: image/jpeg\r\n\r\n');
req.write('fake image content\r\n');
req.write('------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n');
req.end();
