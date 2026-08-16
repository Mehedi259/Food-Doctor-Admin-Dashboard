export default async function handler(req, res) {
  const targetUrl = 'http://178.156.229.53';
  
  // Vercel parses the catch-all parameter 'path'
  const { path } = req.query;
  
  let actualPath = '';
  if (Array.isArray(path)) {
    actualPath = path.join('/');
  } else if (path) {
    actualPath = path;
  }

  // Preserve other query parameters
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  urlObj.searchParams.delete('path'); // Remove the Vercel path parameter
  const searchParams = urlObj.searchParams.toString();

  // Reconstruct final URL
  let finalUrl = `${targetUrl}/api/${actualPath}`;
  if (searchParams) {
    finalUrl += `?${searchParams}`;
  }

  try {
    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: '178.156.229.53',
      },
    };

    delete options.headers['connection'];
    delete options.headers['content-length'];
    delete options.headers['origin'];
    delete options.headers['referer'];
    delete options.headers['cookie']; // Prevent Django CSRF errors

    // We shouldn't forward host from the original request
    // It's already overwritten by host: '178.156.229.53'
    delete options.headers['host'];

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(finalUrl, options);
    
    const contentType = response.headers.get('content-type');
    let responseBody;
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (key !== 'content-encoding' && key !== 'content-length' && key !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.send(responseBody);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Proxy Request Failed', details: error.message });
  }
}
