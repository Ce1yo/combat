const express = require('express');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const cors = require('cors');
const path = require('path');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialiser la base de données avec un objet vide
db.defaults({ content: {} }).write();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Route pour sauvegarder les modifications
app.post('/api/save', (req, res) => {
    const { path, selector, content } = req.body;
    
    if (!db.get('content').has(path).value()) {
        db.get('content').set(path, {}).write();
    }
    
    db.get(`content.${path}`).set(selector, content).write();
    res.json({ success: true });
});

// Route pour récupérer le contenu
app.get('/api/content', (req, res) => {
    const content = db.get('content').value();
    res.json(content);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
