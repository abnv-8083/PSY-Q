import https from 'https';
https.get('https://www.google.com', (res) => {
  console.log('Status:', res.statusCode);
}).on('error', (e) => {
  console.error('Error:', e.message);
});
