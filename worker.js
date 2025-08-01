addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

let serverList = [];

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/update' && request.method === 'POST') {
    try {
      const data = await request.json();
      const { placeId, jobId, playerCount, models } = data;

      if (!placeId || !jobId || playerCount == null || !models) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const existingServerIndex = serverList.findIndex(
        server => server.placeId === placeId && server.jobId === jobId
      );

      if (existingServerIndex !== -1) {
        serverList[existingServerIndex] = { placeId, jobId, playerCount, models, timestamp: Date.now() };
      } else {
        serverList.push({ placeId, jobId, playerCount, models, timestamp: Date.now() });
      }

      serverList = serverList.filter(server => Date.now() - server.timestamp < 3600000);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to process request: ' + error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  if (path === '/list' && request.method === 'GET') {
    try {
      return new Response(JSON.stringify(serverList), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to retrieve server list: ' + error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  }

  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' },
  });
}
