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
      content = JSON.parse(fs.readFileSync(con