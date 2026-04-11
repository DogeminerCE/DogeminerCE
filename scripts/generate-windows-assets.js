const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon used for the Store logo.
const SOURCE_ICON = path.join(__dirname, '../assets/helpers/shibes/shibes-idle-0.webp');
const TARGET_DIR = path.join(__dirname, '../packaging/windows/Assets');

if (!fs.existsSync(TARGET_DIR)) {
    console.log(`Creating directory: ${TARGET_DIR}`);
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Images that are required by the AppxManifest.xml.
const images = [
    { name: 'StoreLogo.png', size: [50, 50] },
    { name: 'Square44x44Logo.png', size: [44, 44] },
    { name: 'Square150x150Logo.png', size: [150, 150] },
    { name: 'Wide310x150Logo.png', size: [310, 150] },
    { name: 'SplashScreen.png', size: [620, 300] }
];

async function generate() {
    console.log(`Source icon: ${SOURCE_ICON}`);
    if (!fs.existsSync(SOURCE_ICON)) {
        throw new Error(`Source icon not found at ${SOURCE_ICON}`);
    }

    const sourceImage = sharp(SOURCE_ICON);

    for (const img of images) {
        console.log(`Generating ${img.name} (${img.size[0]}x${img.size[1]})...`);
        const [w, h] = img.size;
        
        // Background color for the tile.
        const bg = { r: 255, g: 255, b: 255, alpha: 1 };
        
        // Create the tile with the shibe as a composite.
        await sharp({
            create: {
                width: w,
                height: h,
                channels: 4,
                background: bg
            }
        })
        .composite([{
            input: await sourceImage
                .resize({ 
                    width: Math.floor(w * 0.7), 
                    height: Math.floor(h * 0.7),
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .toBuffer(),
            gravity: 'center'
        }])
        .png()
        .toFile(path.join(TARGET_DIR, img.name));
    }
    console.log('Successfully generated Windows packaging assets.');
}

generate().catch(err => {
    console.error('Error generating assets:', err);
    process.exit(1);
});
