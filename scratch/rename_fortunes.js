const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'play', 'assets', 'general', 'icons', 'Fortunes');

function sanitize() {
    if (!fs.existsSync(basePath)) {
        console.error('Path not found:', basePath);
        return;
    }

    const items = fs.readdirSync(basePath);
    
    items.forEach(item => {
        const fullPath = path.join(basePath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            // Match "Fortune of Günther" (or mangled versions like "Gnther")
            if (item.includes('Fortune of G') && item !== 'Fortune of Gunther') {
                const newName = 'Fortune of Gunther';
                const newPath = path.join(basePath, newName);
                console.log(`Renaming folder: ${item} -> ${newName}`);
                fs.renameSync(fullPath, newPath);
                
                // Also rename .txt inside
                const subItems = fs.readdirSync(newPath);
                subItems.forEach(subItem => {
                    if (subItem.endsWith('.txt')) {
                        const oldTxt = path.join(newPath, subItem);
                        const newTxt = path.join(newPath, newName + '.txt');
                        console.log(`Renaming file: ${subItem} -> ${newName}.txt`);
                        fs.renameSync(oldTxt, newTxt);
                    }
                });
            }
            
            // Match "Fortune of the Ð" (or mangled)
            if (item.includes('Fortune of the ') && !item.includes('Ð') && item.length > 15 && !item.endsWith(' D')) {
                 // Try to find the one with non-ascii
                 if (/[^\x00-\x7F]/.test(item)) {
                    const newName = 'Fortune of the D';
                    const newPath = path.join(basePath, newName);
                    console.log(`Renaming folder: ${item} -> ${newName}`);
                    fs.renameSync(fullPath, newPath);

                    const subItems = fs.readdirSync(newPath);
                    subItems.forEach(subItem => {
                        if (subItem.endsWith('.txt')) {
                            const oldTxt = path.join(newPath, subItem);
                            const newTxt = path.join(newPath, 'Fortune of the D.txt');
                            console.log(`Renaming file: ${subItem} -> Fortune of the D.txt`);
                            fs.renameSync(oldTxt, newTxt);
                        }
                    });
                 }
            }
            
            // Explicit check for the Ð one if above regex was too strict
            if (item.includes('Fortune of the') && (item.charCodeAt(item.length-1) > 127 || item.includes(''))) {
                const newName = 'Fortune of the D';
                const newPath = path.join(basePath, newName);
                console.log(`Renaming folder (fallback): ${item} -> ${newName}`);
                if (fs.existsSync(newPath)) {
                    console.log('Skipping, already exists');
                } else {
                    fs.renameSync(fullPath, newPath);
                }
            }
        }
    });
}

sanitize();
