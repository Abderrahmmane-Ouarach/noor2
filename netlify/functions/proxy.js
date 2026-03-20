exports.handler = async (event) => {
  const base = (process.env.API_BASE || '').replace(/\/$/, '');
  const path = event.path.replace('/.netlify/functions/proxy', '');
  const qs   = event.rawQuery ? '?' + event.rawQuery : '';
  const url  = base + path + qs;

  try {
    const r = await fetch(url);
    const body = await r.text();
    return {
      statusCode: r.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300',
      },
      body,
    };
  } catch (e) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Proxy error', detail: e.message }),
    };
  }
};
