const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
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
    const contentFilePath = path.join(__dirname, '../../content/site-content.json');
    
    // Lire le fichier de contenu
    let content = {};
    try {
      content = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
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
