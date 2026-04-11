const fs = require('fs');
const path = require('path');

const basePaths = [
    path.join(__dirname, '..', 'play', 'assets', 'general', 'icons', 'Fortunes'),
    path.join(__dirname, '..', 'assets', 'general', 'icons', 'Fortunes')
];

function repair() {
    basePaths.forEach(basePath => {
        if (!fs.existsSync(basePath)) {
            console.log(`Path not found: ${basePath}`);
            return;
        }
        
        console.log(`Processing path: ${basePath}`);
        const items = fs.readdirSync(basePath);

        // First pass: Restore accidental renames
        items.forEach(item => {
            const fullPath = path.join(basePath, item);
            if (item === 'Fortune of the D') {
                const content = fs.readdirSync(fullPath);
                if (content.some(f => f.includes('AstroDoge'))) {
                    console.log(`  Restoring AstroDoge folder in ${basePath}`);
                    const restoredPath = path.join(basePath, 'Fortune of the AstroDoge');
                    if (!fs.existsSync(restoredPath)) {
                        fs.renameSync(fullPath, restoredPath);
                    } else {
                        console.log('    Restored path already exists, merging...');
                        // Move files then delete
                        fs.readdirSync(fullPath).forEach(f => {
                            fs.renameSync(path.join(fullPath, f), path.join(restoredPath, f));
                        });
                        fs.rmdirSync(fullPath);
                    }
                }
            }
        });

        // Second pass: Final sanitization
        const refreshedItems = fs.readdirSync(basePath);
        refreshedItems.forEach(item => {
            const hasNonAscii = /[^\x00-\x7F]/.test(item);
            if (hasNonAscii) {
                let newName = item;
                if (item.includes('G') || item.includes('nther')) {
                    newName = 'Fortune of Gunther';
                } else if (item.includes('the') && (item.includes('Ð') || item.length < 20)) {
                    newName = 'Fortune of the D';
                }

                if (newName !== item) {
                    const oldPath = path.join(basePath, item);
                    const newPath = path.join(basePath, newName);
                    console.log(`  Sanitizing: ${item} -> ${newName}`);
                    
                    if (fs.existsSync(newPath)) {
                        console.log(`    Mergin with existing ${newName}`);
                        fs.readdirSync(oldPath).forEach(f => {
                            const oldFile = path.join(oldPath, f);
                            const newFile = path.join(newPath, f);
                            if (!fs.existsSync(newFile)) fs.renameSync(oldFile, newFile);
                        });
                        // Try to remove old
                        try { fs.rmdirSync(oldPath, { recursive: true }); } catch(e) {}
                    } else {
                        fs.renameSync(oldPath, newPath);
                    }

                    // Rename internal txt file to match folder
                    const targetDir = fs.existsSync(newPath) ? newPath : oldPath;
                    if (fs.existsSync(targetDir)) {
                        fs.readdirSync(targetDir).forEach(f => {
                            if (f.endsWith('.txt') && /[^\x00-\x7F]/.test(f)) {
                                fs.renameSync(path.join(targetDir, f), path.join(targetDir, newName + '.txt'));
                            }
                        });
                    }
                }
            }
        });
    });
}

repair();
