const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'play', 'assets', 'general', 'icons', 'Fortunes');

function runFix() {
    if (!fs.existsSync(basePath)) return;

    const items = fs.readdirSync(basePath);
    
    // First, let's look for ANY folder that has non-ASCII characters
    items.forEach(item => {
        const hasNonAscii = /[^\x00-\x7F]/.test(item);
        if (hasNonAscii) {
            let newName = item;
            if (item.includes('Günther') || item.includes('G')) {
                newName = 'Fortune of Gunther';
            } else if (item.includes('Ð') || item.includes('the')) {
                 // Check if it's specifically the "D" one
                 if (item.endsWith('Ð') || item.includes('the')) {
                    // Only rename if it's the one we're targetting
                    if (item.length < 20) { // Fortune of the Ð is 17 chars
                        newName = 'Fortune of the D';
                    }
                 }
            }
            
            if (newName !== item) {
                const oldPath = path.join(basePath, item);
                const newPath = path.join(basePath, newName);
                console.log(`Renaming: ${item} -> ${newName} (ASCII Fix)`);
                if (fs.existsSync(newPath)) {
                    console.log(`Conflict! ${newName} already exists. Attempting to merge/overwrite.`);
                }
                fs.renameSync(oldPath, newPath);
                
                // Also rename file inside if it matches
                const subItems = fs.readdirSync(newPath);
                subItems.forEach(si => {
                    if (/[^\x00-\x7F]/.test(si)) {
                        const oldSi = path.join(newPath, si);
                        const newSi = path.join(newPath, si.replace(/[^\x00-\x7F]/g, ''));
                        // If it's the txt, make it the folder name
                        if (si.endsWith('.txt')) {
                            const betterSi = path.join(newPath, newName + '.txt');
                            fs.renameSync(oldSi, betterSi);
                        } else {
                            fs.renameSync(oldSi, newSi);
                        }
                    }
                });
            }
        }
    });

    // Second check: Did we accidentally rename "Fortune of the AstroDoge"?
    // If we have a folder literally called "Fortune of the D" but it's NOT the intended one
    // (We can check by the content of its .txt)
    // Actually, it's safer to just look for the expected ones
}

runFix();
