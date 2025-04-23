const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const { path: pagePath, selector, content } = JSON.parse(event.body);
    const contentFilePath = path.join(__dirname, '../../content/site-content.json');
    
    // Lire le fichier existant
    let siteContent = {};
    try {
      siteContent = JSON.parse(fs.readFileSync(contentFilePath, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }

    // Mettre à jour le contenu
    if (!siteContent[pagePath]) siteContent[pagePath] = {};
    siteContent[pagePath][selector] = content;

    // Sauvegarder le fichier
    fs.writeFileSync(contentFilePath, JSON.stringify(siteContent, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Save error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Failed to save content', details: error.message })
    };
  }
};
