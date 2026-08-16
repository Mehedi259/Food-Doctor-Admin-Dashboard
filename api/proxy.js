export default async function handler(req, res) {
  const targetUrl = 'http://178.156.229.53';
  
  // Vercel extracts the path inside /api/... if it's dynamic, 
  // but let's just grab the path from the request URL.
  // Example: req.url might be /api/proxy/users/auth/login-password/
  // We want to map /api/proxy/* to /* on the target.
  const path = req.url.replace(/^\/api\/proxy/, '');
  const url = `${targetUrl}${path}`;

  try {
    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: '178.156.229.53', // Override host header
      },
    };

    // Remove headers that might cause issues
    delete options.headers['connection'];
    delete options.headers['content-length'];

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    
    const contentType = response.headers.get('content-type');
    let responseBody;
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    // Set status
    res.status(response.status);

    // Forward headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.send(responseBody);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
  }
}
