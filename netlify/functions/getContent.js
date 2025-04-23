exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Récupérer toutes les clés qui commencent par 'content_'
    const keys = await context.store.list({ prefix: 'content_' });
    const content = {};

    // Récupérer le contenu pour chaque clé
    for (const key of keys) {
      const value = await context.store.get(key);
      const [, path, selector] = key.split('_');
      
      if (!content[path]) content[path] = {};
      content[path][selector] = value;
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify(content)
    };
  } catch (error) {
    console.error('Get content error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Failed to get content', details: error.message })
    };
  }
};
