const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
  'msg0': 'Hello World!',
  'msg1': 'Hello World!',
  'msg2': 'Hello World!',
  'msg3': 'Hello World!',
  'msg4': 'Hello World!',
  'msg5': 'Hello World!',
  'msg6': 'Hello World!',
  'msg7': 'Hello World!',
  'msg8': 'Hello World!',
  'msg9': 'Hello World!',
  'msg10': 'Hello World!',
  'msg11': 'Hello World!',
  'msg12': 'Hello World!',
  'msg13': 'Hello World!',
  'msg14': 'Hello World!',
  'msg15': 'Hello World!',
  'msg16': 'Hello World!',
  'msg17': 'Hello World!',
  'msg18': 'Hello World!',
  'msg19': 'Hello World!',
  'r0i0': 0
});

const options = {
  hostname: 'bobito-cc.umbler.net',
  //hostname: 'localhost',
  //port: 3000,
  path: '/scoreBoard/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();

