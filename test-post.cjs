const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
  }
}, (res) => {
  console.log(res.statusCode);
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
