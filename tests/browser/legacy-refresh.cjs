const {launch, output} = require('./harness.cjs');
const fs = require('node:fs'), assert = require('node:assert/strict');
(async () => {
    const browser = await launch(), rows = [], errors = [], missing = [];
    fs.mkdirSync(output + '/legacy-refresh', {recursive: true});
    let page;
    try {
        page = await browser.newPage();
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => {
            if (response.url().startsWith('http://localhost:8011/') && response.status() >= 400)
                missing.push({url: response.url(), status: response.status()});
        });
        await page.goto('http://localhost:8011/play/?parityTest=checkpoint-69');
        await page.waitForFunction(() => window.game?._bootComplete);
        await page.locator('#loading-screen').waitFor({state: 'hidden'});
        for (const width of [1280, 375]) for (const planet of ['earth', 'moon', 'mars', 'jupiter', 'titan']) {
            await page.setViewportSize({width, height: width === 375 ? 812 : 800});
            const row = await page.evaluate(planet => {
                game.setLayoutMode('auto');
                ParityCheckpointTests.previewSeason({season: 'none', planet});
                const category = game.getHelperCategoryForLevel();
                const types = Object.keys(shopManager.shopData[category]).slice(0, 3);
                const data = saveManager.createSaveData();
                data[category] = types.flatMap((type, i) => Array.from({length: i + 2}, () => ({type, dps: 1})));
                data.helperUpgradeLevels = {};
                data.helperUpgradeOffers = {[planet]: [...types]};
                data.dogecoins = 1e30; data.dogediamonds = 100;
                data.settings.autoPlaceHelpers = true;
                saveManager._prepareAndApplySaveData(data, {persist: true});
                game.isPlaying = false; game.isStoryOpen = false; game.isIntroPlaying = false;
                game.isCutscenePlaying = false; game.isTransitioning = false;
                uiManager.updateShopContent(); uiManager.updateMobileShopContent();
                uiManager.updateUpgradeContent(); uiManager.updateMobileUpgradesContent();
                game.updateUI();
                const shopButtons = () => [...document.querySelectorAll('.shop-grid-item .shop-buy-btn[data-helper-type]')];
                const nodes = shopButtons(), offers = uiManager.getAvailableHelperUpgrades();
                const controls = [...document.querySelectorAll('[data-upgrade-helper][data-upgrade-currency]')];
                const measure = fn => {
                    fn(); const observer = new MutationObserver(() => {});
                    observer.observe(document.getElementById('game-container'), {subtree: true, childList: true, attributes: true, characterData: true});
                    for (let i = 0; i < 20; i++) fn();
                    const records = observer.takeRecords(); observer.disconnect();
                    return records.map(record => ({type: record.type, node: record.target.id || record.target.className}));
                };
                const mutations = measure(() => game.updateShopPrices());
                const identities = nodes.every((node, i) => shopButtons()[i] === node);
                game.dogecoins = 0; game.dogediamonds = 0; game.updateShopPrices();
                const blocked = shopButtons().every(button => button.disabled) && controls.every(button => button.disabled);
                game.dogecoins = 1e30; game.dogediamonds = 100; game.updateShopPrices();
                const pricesValid = shopButtons().every(button => {
                    const type = button.dataset.helperType, helper = shopManager.shopData[category][type];
                    if (!helper) return true;
                    const owned = game.getHelperArrayForLevel().filter(h => h.type === type).length;
                    const card = button.closest('.shop-grid-item');
                    return card.querySelector('.shop-item-quantity').textContent === '#' + owned
                        && card.querySelector('.buy-btn-price').textContent === game.formatNumber(game.getHelperCost(helper.baseCost, owned, type))
                        && button.disabled === (button.classList.contains('locked') || game.isWorldHelperAvailable(type) === false);
                });
                const type = types[0], owned = game.getHelperArrayForLevel().filter(h => h.type === type).length;
                const bought = game.buyHelper(type);
                const afterPurchase = [...document.querySelectorAll(`.shop-buy-btn[data-helper-type="${type}"]`)]
                    .every(button => button.closest('.shop-grid-item').querySelector('.shop-item-quantity').textContent === '#' + (owned + 1));
                const upgraded = shopManager.buyHelperUpgrade(type, 'dogediamonds', 1);
                const tier = game.helperUpgradeLevels[type];
                const saved = saveManager.createSaveData();
                game[category] = [];
                saveManager._prepareAndApplySaveData(saved, {persist: true});
                game.isPlaying = false;
                game.updateUI(); uiManager.updateMobileAchievementsContent(); uiManager.activeMobileTab = 'achievements'; uiManager.updateMobileStats();
                const total = ['helpers', 'moonHelpers', 'marsHelpers', 'jupiterHelpers', 'titanHelpers'].reduce((n, key) => n + game[key].length, 0);
                return {planet, offers: offers.map(u => ({type: u.helperType, count: u.helperCount})), mutations, identities, blocked, pricesValid,
                    bought, afterPurchase, upgraded, tier, restored: game.getHelperArrayForLevel().filter(h => h.type === type).length,
                    expectedOwned: owned + 1, total, desktopTotal: document.getElementById('helpers-owned').textContent,
                    phoneTotal: document.getElementById('mobile-helpers-owned').textContent};
            }, planet);
            assert.deepEqual(row.mutations, [], JSON.stringify({width, row}));
            for (const key of ['identities', 'blocked', 'pricesValid', 'bought', 'afterPurchase', 'upgraded']) assert.equal(row[key], true, JSON.stringify({width, key, row}));
            assert.equal(row.tier, 1); assert.equal(row.restored, row.expectedOwned);
            assert.equal(row.desktopTotal, String(row.total)); assert.equal(row.phoneTotal, String(row.total));
            assert.deepEqual(row.offers.map(u => u.count), [2, 3, 4]);
            rows.push({width, ...row});
        }
        assert.deepEqual(errors, []); assert.deepEqual(missing, []);
        fs.writeFileSync(output + '/legacy-refresh/results.json', JSON.stringify({rows, errors, missing}, null, 2));
        console.log(JSON.stringify({passed: true, planetLayouts: rows.length, noOpMutations: 0, purchasesAndRestore: true, statistics: true, missingResources: missing.length}));
    } catch (error) {
        await page?.screenshot({path: output + '/legacy-refresh/failure.png'});
        console.error(error); process.exitCode = 1;
    } finally { await browser.close(); }
})();
