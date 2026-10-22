const {launch, output} = require('./harness.cjs');
const fs = require('node:fs'), assert = require('node:assert/strict');
(async () => {
    const browser = await launch(), rows = [], errors = [];
    fs.mkdirSync(output + '/legacy-cleanup', {recursive: true});
    let page;
    try {
        page = await browser.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://localhost:8011/play/?parityTest=checkpoint-69');
        await page.waitForFunction(() => window.game?._bootComplete);
        await page.locator('#loading-screen').waitFor({state: 'hidden'});
        // Blinks below are triggered explicitly so scene assertions do not race
        // the unrelated periodic blink interval.
        await page.evaluate(() => { clearInterval(game.blinkInterval); game.blinkInterval = null; });
        for (const width of [1280, 375]) for (const planet of ['earth', 'moon', 'mars', 'jupiter', 'titan']) {
            await page.setViewportSize({width, height: width === 375 ? 812 : 800});
            await page.evaluate(planet => {
                game.setLayoutMode('auto');
                ParityCheckpointTests.previewSeason({season: 'none', planet});
                const category = game.getHelperCategoryForLevel();
                const data = saveManager.createSaveData();
                const type = Object.keys(shopManager.shopData[category])[0];
                data[category] = Array.from({length: 3}, () => ({type, dps: 1}));
                data.settings.autoPlaceHelpers = true;
                data.dogecoins = 1e15;
                saveManager._prepareAndApplySaveData(data, {persist: true});
                game.isPlaying = false; game.isStoryOpen = false; game.isIntroPlaying = false;
                game.isCutscenePlaying = false; game.isTransitioning = false;
                // An import while eyes are closed must restore the target scene.
                game.blinkDoge();
                saveManager._prepareAndApplySaveData(saveManager.createSaveData(), {persist: true});
                game.isPlaying = false;
            }, planet);
            await page.waitForTimeout(250);
            const row = await page.evaluate(() => {
                const planet = game.currentLevel, category = game.getHelperCategoryForLevel();
                const type = Object.keys(shopManager.shopData[category])[0];
                const original = document.querySelector('#helper-container .helper-sprite:not(.rick-helper)');
                let leakedNames = 0;
                original._helperNameFadeTimer = setTimeout(() => { leakedNames++; }, 50);
                window.__leakedNames = () => leakedNames;
                const epoch = game._helperFieldEpoch;
                for (let n = 0; n < 8; n++) game.recreateHelperSprites();
                const detachedFrames = [...game._fieldFrameScheduler.entries.keys()].filter(sprite => !sprite.isConnected).length;
                const sprites = [...document.querySelectorAll('#helper-container .helper-sprite:not(.rick-helper)')];
                const sameRecords = sprites.length === game.placedHelpers.length && sprites.every(sprite =>
                    game.placedHelpers.some(helper => String(helper.id) === sprite.dataset.helperId));
                const before = game[category].length, coins = game.dogecoins;
                const bought = shopManager.buyHelper(type);
                saveManager.saveGame(false);
                const saved = JSON.parse(localStorage.getItem('dogeminer_ce_save'));
                const committed = bought && game[category].length === before + 1
                    && saved[category].length === before + 1 && game.dogecoins < coins;
                const wallet = game.dogecoins, count = game[category].length;
                game.dogecoins = 0;
                const rejected = shopManager.buyHelper(type);
                const blockedWithoutFunds = rejected === false && game.dogecoins === 0 && game[category].length === count;
                game.dogecoins = wallet;
                return {planet, mobilePlanet: document.getElementById('mobile-planet-name').textContent,
                    mobileIcon: document.getElementById('mobile-current-planet-icon').getAttribute('src'), char: document.getElementById('main-character').getAttribute('src'),
                    platform: document.getElementById('platform').getAttribute('src'),
                    themes: ['moon-theme', 'planet-mars', 'planet-jupiter', 'planet-titan'].filter(theme => document.body.classList.contains(theme)),
                    sameRecords, detachedFrames, cleanupEpochs: game._helperFieldEpoch - epoch, committed, blockedWithoutFunds};
            });
            await page.waitForTimeout(75);
            row.leakedNames = await page.evaluate(() => __leakedNames());
            const char = planet === 'earth' ? 'standard' : planet === 'mars' ? 'party' : 'spacehelmet';
            assert.ok(row.char.endsWith(`/character/${char}.webp`), JSON.stringify(row));
            const themes = {earth: [], moon: ['moon-theme'], mars: ['planet-mars'], jupiter: ['planet-jupiter'], titan: ['planet-titan']};
            assert.deepEqual(row.themes, themes[planet]);
            assert.equal(row.mobilePlanet, planet.charAt(0).toUpperCase() + planet.slice(1));
            assert.ok(row.mobileIcon.endsWith(`/general/${planet}.webp`));
            for (const key of ['sameRecords', 'committed', 'blockedWithoutFunds']) assert.equal(row[key], true, JSON.stringify({key, width, row}));
            assert.equal(row.detachedFrames, 0); assert.equal(row.leakedNames, 0);
            assert.ok(row.cleanupEpochs >= 8);
            rows.push({width, ...row});
            if (planet === 'titan') await page.screenshot({path: output + `/legacy-cleanup/titan-${width}.png`});
        }
        // Exercise the actual delayed travel path too. This fixture grants all
        // routes; progression/locked-route behavior has separate coverage.
        await page.evaluate(() => {
            game.worldDiscovery.unlocked = ['earth', 'moon', 'mars', 'jupiter', 'titan'];
            game.worldDiscovery.known = [...game.worldDiscovery.unlocked];
            game.unlockedLevels = new Set(game.worldDiscovery.unlocked);
            game.hasPlayedMoonLaunch = true;
            game.storiesEnabled = false;
        });
        for (const width of [375, 1280]) {
            await page.setViewportSize({width, height: width === 375 ? 812 : 800});
            for (const planet of ['earth', 'moon', 'mars', 'jupiter', 'titan']) {
                await page.evaluate(planet => {
                    game.isStoryOpen = false; game.isIntroPlaying = false; game.isCutscenePlaying = false;
                    game.isBetaReportOpen = false; game.isOfflineReportOpen = false;
                    switchPlanet(planet);
                }, planet);
                await page.waitForFunction(planet => game.currentLevel === planet && !game.isTransitioning, planet);
                const state = await page.evaluate(() => ({planet: game.currentLevel,
                    mobile: document.getElementById('mobile-planet-name').textContent,
                    character: document.getElementById('main-character').getAttribute('src'),
                    body: document.body.dataset.planet,
                    helperTypes: [...new Set(game.placedHelpers.map(h => h.type))],
                    expectedTypes: [...new Set(game[game.getPlacedHelperKey()].map(h => h.type))]}));
                assert.equal(state.body, planet); assert.equal(state.mobile.toLowerCase(), planet);
                assert.deepEqual(state.helperTypes, state.expectedTypes);
                const sprite = planet === 'earth' ? 'standard' : planet === 'mars' ? 'party' : 'spacehelmet';
                assert.ok(state.character.endsWith(`/character/${sprite}.webp`), JSON.stringify(state));
                rows.push({width, travel: true, ...state});
            }
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(output + '/legacy-cleanup/results.json', JSON.stringify({rows, errors}, null, 2));
        console.log(JSON.stringify({passed: true, restoredScenes: 10, travelScenes: 10, rebuilds: 80, staleFrames: 0, leakedNameTimers: 0, legacyPurchaseSaveAndWalletGuards: true}));
    } catch (error) {
        await page?.screenshot({path: output + '/legacy-cleanup/failure.png'});
        console.error(error); process.exitCode = 1;
    } finally { await browser.close(); }
})();
