# Dogeminer: Community Edition

[![GitHub stars](https://img.shields.io/github/stars/DogeminerCE/DogeminerCE?style=social)](https://github.com/DogeminerCE/DogeminerCE)
[![License](https://img.shields.io/badge/license-APACHE-blue.svg)](Code%20License)
[![Play Online](https://img.shields.io/badge/play-online-green.svg)](https://dogeminerce.com)
[![Discord](https://img.shields.io/badge/discord-join-7289da.svg?logo=discord&logoColor=white)](https://discord.gg/7wHMAQwMtr)

A modern, open-source Dogecoin mining simulator built with JavaScript and HTML5. Mine Dogecoins, buy helpers, upgrade your pickaxes, and build your DogeCoin empire!

## 🎮 Play Now

**[Play Dogeminer CE Online](https://dogeminerce.com)**

### Run Locally (Cloud Saves will not work)
1. Clone the repository:
   ```bash
   git clone https://github.com/DogeminerCE/DogeminerCE.git
   cd DogeminerCE
   ```

2. Open `play/index.html` in your web browser
3. Start mining Dogecoins!
(Note: If you open the MAIN index.html and click play, it redirects to https://dogeminerce.com/play, not the local version)

### Microsoft Store / Windows Packaging
DogeminerCE can be bundled into a standalone MSIX package for the Microsoft Store.

1. **Install dependencies**: `npm install`
2. **Generate assets**: `node scripts/generate-windows-assets.js`
3. **Build the package**: `npm run build:windows`

To install the resulting `.msix` file locally for testing, you first need to run `scripts/create-test-cert.ps1` and trust the generated certificate.

### CI/CD
A GitHub Action automatically builds an MSIX package on every push to the `main` branch. You can find the latest builds in the "Actions" tab or on the Releases page if configured.

### Code License
This project's code is licensed under the Apache 2.0 License - see the [Code License](LICENSE) file for details.

### Asset License
The assets have different licensing terms. Please check the [Asset License](Asset%20License) file for details.

