const fs = require('fs');
const path = require('path');

const directory = '.';
const files = fs.readdirSync(directory);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(directory, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier si admin.css est déjà présent
        if (!content.includes('href="admin.css"')) {
            content = content.replace(
                '<link rel="stylesheet" href="style.css">',
                '<link rel="stylesheet" href="style.css">\n    <link rel="stylesheet" href="admin.css">'
            );
        }
        
        // Vérifier si admin.js est présent et correctement configuré
        if (content.includes('src="admin.js"') && !content.includes('type="module" src="admin.js"')) {
            content = content.replace(
                'src="admin.js"',
                'type="module" src="admin.js"'
            );
        } else if (!content.includes('src="admin.js"')) {
            content = content.replace(
                '</head>',
                '    <script type="module" src="admin.js"></script>\n</head>'
            );
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
