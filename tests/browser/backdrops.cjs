const {launch, output} = require('./harness.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sharp = require('sharp');

(async () => {
    const browser = await launch(), rows = [], errors = [];
    const directory = output + '/backdrops';
    fs.mkdirSync(directory, {recursive: true});
    let page;
    try {
        page = await browser.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://localhost:8011/play/?parityTest=checkpoint-69');
        await page.waitForFunction(() => window.game?._bootComplete);
        await page.locator('#loading-screen').waitFor({state: 'hidden'});
        const measure = () => page.evaluate(() => {
            const rect = node => node.getBoundingClientRect().toJSON();
            const panels = ['left-panel', 'right-panel'].map(id => document.getElementById(id))
                .filter(node => node.checkVisibility()).map(rect);
            const left = Math.max(0, Math.min(...panels.map(r => r.left)));
            const top = Math.max(0, Math.min(...panels.map(r => r.top)));
            const right = Math.min(innerWidth, Math.max(...panels.map(r => r.right)));
            const bottom = Math.min(innerHeight, Math.max(...panels.map(r => r.bottom)));
            return {
                expected: {left, top, right, bottom},
                layers: [...document.querySelectorAll('.dogebag-backdrop')].map(rect),
                scene: rect(document.querySelector('.dogebag-scene')),
                opacity: getComputedStyle(document.getElementById('dogebag-modal')).opacity
            };
        });
        const check = async label => {
            await page.waitForFunction(() => {
                const modal = document.getElementById('dogebag-modal');
                return modal.classList.contains('active') && !modal.classList.contains('closing')
                    && Number(getComputedStyle(modal).opacity) > .99;
            });
            await page.waitForTimeout(100);
            const state = await measure();
            assert.equal(state.layers.length, 1, label + ': one backing');
            assert.equal(Number(state.opacity), 1, label + ': backing fully faded in');
            for (const edge of ['left', 'top', 'right', 'bottom']) {
                assert.ok(Math.abs(state.layers[0][edge] - state.expected[edge]) < 1,
                    JSON.stringify({label, edge, state}));
                assert.ok(Math.abs(state.scene[edge] - state.expected[edge]) < 1,
                    label + ': backing and content follow the same bounds');
            }
            rows.push({label, ...state});
            return state;
        };
        for (const config of [
            {width: 1440, height: 900, mode: 'auto', zoom: 1},
            {width: 2000, height: 1100, mode: 'auto', zoom: 1.25},
            {width: 768, height: 1024, mode: 'tablet', zoom: 1},
            {width: 375, height: 812, mode: 'auto', zoom: 1},
            {width: 320, height: 568, mode: 'auto', zoom: 1},
            {width: 844, height: 390, mode: 'phone', zoom: 1},
            {width: 1440, height: 900, mode: 'phone', zoom: 1},
            {width: 375, height: 812, mode: 'desktop', zoom: 1}
        ]) {
            await page.setViewportSize({width: config.width, height: config.height});
            await page.evaluate(config => {
                document.documentElement.style.zoom = String(config.zoom);
                game.setLayoutMode(config.mode);
            }, config);
            for (const kind of ['bag', 'mystery']) {
                await page.evaluate(kind => {
                    ParityCheckpointTests.previewSeason({season: 'none', planet: 'moon'});
                    game.isPlaying = false;
                    if (kind === 'bag') {
                        game.restoreDogebagStacks({moon: {0: 1}});
                        game.syncFieldLoot();
                        game.openDogebagModal(document.querySelector('.dogebag-drop'));
                    } else {
                        game.mysteryBoxObtained = true;
                        game.mysteryBoxEvolutionPending = false;
                        game._mysteryEntryAt = 0;
                        game._mysteryBoxReadyAt = 0;
                        game.mysteryBoxTimerRemaining = 0;
                        game.openMysteryBoxModal();
                    }
                }, kind);
                const label = `${kind}-${config.width}-${config.mode}-${config.zoom}`;
                const state = await check(label);
                await page.screenshot({path: directory + '/' + label + '.png'});
                if (config.width === 1440 && config.mode === 'auto') {
                    // Rasterize the backing over black, with the reward card and
                    // underlying panels hidden. A missing seam/top-right area
                    // must fail even if element bounds appear to cover it.
                    const style = await page.addStyleTag({content: `
                        body {background: #000 !important;}
                        #background-container, .background-image, .game-panel, #planet-tabs,
                        .dogebag-scene {visibility: hidden !important;}
                    `});
                    const {data, info} = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject: true});
                    const b = state.layers[0], seam = state.expected.left + 632;
                    const points = [
                        [seam, b.top + 15], [seam, b.top + 120], [seam, b.bottom - 15],
                        [b.right - 20, b.top + 15], [b.right - 20, b.top + 45]
                    ];
                    for (const [x, y] of points) {
                        const index = (Math.round(y) * info.width + Math.round(x)) * info.channels;
                        assert.ok([...data.subarray(index, index + 3)].every(value => value >= 225),
                            JSON.stringify({label, x, y, pixel: [...data.subarray(index, index + 3)]}));
                    }
                    await style.evaluate(node => node.remove());
                }
                await page.evaluate(() => game.closeDogebagModal());
                assert.equal(await page.locator('.dogebag-backdrop').count(), 1, 'Keep backing during close fade');
                await page.waitForTimeout(550);
                assert.equal(await page.locator('#dogebag-modal').evaluate(node => node.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})), false);
            }
        }
        // Resize and switch layout while the same reward screen remains open.
        await page.setViewportSize({width: 1440, height: 900});
        await page.evaluate(() => {
            game.setLayoutMode('auto');
            ParityCheckpointTests.previewSeason({season: 'none', planet: 'moon'});
            game.isPlaying = false;
            game.restoreDogebagStacks({moon: {0: 1}});
            game.openDogebagModal(document.querySelector('.dogebag-drop'));
        });
        await check('resize-before');
        await page.setViewportSize({width: 375, height: 812});
        await check('resize-phone');
        await page.setViewportSize({width: 1440, height: 900});
        await page.evaluate(() => game.setLayoutMode('phone'));
        await check('layout-phone');
        await page.evaluate(() => game.setLayoutMode('desktop'));
        await check('layout-desktop');
        // Inventory dialogs already use one white backing. Check that their
        // rectangle includes the gap and the space above the right panel too.
        await page.evaluate(() => {game.resetDogebagPresentation();game.openPickaxeModal();});
        await page.waitForTimeout(400);
        const inventory = await page.locator('#pickaxe-modal').evaluate(node => ({
            rect: node.getBoundingClientRect().toJSON(), background: getComputedStyle(node).backgroundColor,
            bounds: PopupPresentation.panelBounds()
        }));
        for (const edge of ['left', 'top']) assert.ok(Math.abs(inventory.rect[edge] - inventory.bounds[edge]) < 1);
        assert.ok(Math.abs(inventory.rect.width - inventory.bounds.width) < 1);
        assert.match(inventory.background, /255, 255, 255/);
        assert.deepEqual(errors, []);
        fs.writeFileSync(directory + '/results.json', JSON.stringify({rows, inventory, errors}, null, 2));
        console.log(JSON.stringify({passed: true, rewardLayouts: rows.length, rasterCoverage: true, inventory: true}));
    } catch (error) {
        await page?.screenshot({path: directory + '/failure.png'});
        console.error(error);
        console.error(await page?.evaluate(() => ({className: document.getElementById('dogebag-modal').className, view: !!game._dogebagReveal, transitioning: game.isTransitioning, style:document.getElementById('dogebag-modal').getAttribute('style'), animations:document.getElementById('dogebag-modal').getAnimations().map(a=>({state:a.playState, frames:a.effect.getKeyframes()}))})));
        process.exitCode = 1;
    } finally { await browser.close(); }
})();
