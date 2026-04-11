const fs = require('fs');
const path = require('path');

const stagingDir = process.argv[2];
if (!stagingDir || !fs.existsSync(stagingDir)) {
    console.error('Usage: node sanitize-msix-payload.js <stagingDir>');
    process.exit(1);
}

// Characters that are illegal or problematic in MSIX package paths
const illegalChars = /['\(\)\[\]]/;
// Non-ASCII characters (ü, Ð, etc.) that MakeAppx rejects
const nonAscii = /[^\x00-\x7F]/;
// System/dev files to delete entirely
const systemFiles = ['desktop.ini', 'thumbs.db', '.ds_store'];
// File extensions to delete (source/dev files not needed at runtime)
const devExtensions = ['.psd', '.psd1'];

let renamedCount = 0;
let deletedCount = 0;

function sanitize(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const lowerItem = item.toLowerCase();
        const ext = path.extname(item).toLowerCase();
        const oldPath = path.join(dir, item);
        let s;
        try {
            s = fs.statSync(oldPath);
        } catch (e) {
            continue;
        }

        // Delete system files
        if (systemFiles.includes(lowerItem)) {
            console.log(`  Deleting system file: ${item}`);
            fs.unlinkSync(oldPath);
            deletedCount++;
            continue;
        }

        // Delete dev-only files (.psd, etc.)
        if (!s.isDirectory() && devExtensions.includes(ext)) {
            console.log(`  Deleting dev file: ${item}`);
            fs.unlinkSync(oldPath);
            deletedCount++;
            continue;
        }

        // Check if name needs sanitizing (illegal chars OR non-ASCII)
        const needsRename = illegalChars.test(item) || nonAscii.test(item);

        if (needsRename) {
            // Replace illegal chars and transliterate common non-ASCII
            let newName = item
                .replace(/['\(\)\[\]]/g, '')  // Remove illegal chars
                .replace(/ü/g, 'u')           // ü → u
                .replace(/Ð/g, 'D')           // Ð → D
                .replace(/[^\x00-\x7F]/g, '_'); // Any remaining non-ASCII → underscore

            const newPath = path.join(dir, newName);

            if (fs.existsSync(newPath)) {
                console.log(`  Conflict: ${item} -> ${newName} (Removing)`);
                if (s.isDirectory()) {
                    fs.rmSync(oldPath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(oldPath);
                }
                deletedCount++;
            } else {
                console.log(`  Renaming: ${item} -> ${newName}`);
                fs.renameSync(oldPath, newPath);
                renamedCount++;
                // Continue walk into new path if directory
                if (s.isDirectory()) {
                    sanitize(newPath);
                }
            }
        } else if (s.isDirectory()) {
            sanitize(oldPath);
        }
    }
}

console.log(`Sanitizing staging area: ${stagingDir}`);
sanitize(stagingDir);
console.log(`Done. Renamed: ${renamedCount}, Deleted: ${deletedCount}`);
