const API_ORIGIN = 'https://nextsyght.onrender.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const backendUrl = new URL(url.pathname + url.search, API_ORIGIN);
      const backendRequest = new Request(backendUrl, request);

      try {
        const response = await fetch(backendRequest);
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch {
        return Response.json(
          { error: 'The NextSyght API is temporarily unavailable' },
          { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
