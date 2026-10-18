const fs = require('node:fs');
const assert = require('node:assert/strict');
const {launch, output} = require('./harness.cjs');

(async () => {
    const browser = await launch(), rows = [];
    try {
        const cases = [
            ['localhost', 'http://localhost:8011/play/'],
            ['public', 'https://dogeminerce.com/play/'],
            ['public-query', 'https://dogeminerce.com/play/?parityTest=checkpoint-69'],
            ['www-query', 'https://www.dogeminerce.com/play/?parityTest=checkpoint-69'],
            ['native-query', 'https://dogeminerce.local/play/?parityTest=checkpoint-69'],
            ['lookalike-host', 'https://localhost.example.com/play/?parityTest=checkpoint-69']
        ];
        for (const [name, url] of cases) {
            const context = await browser.newContext(), origin = new URL(url).origin;
            await context.route('**/*', async route => {
                const request = new URL(route.request().url());
                if (request.origin !== origin) return route.abort();
                const response = await route.fetch({url: 'http://localhost:8011' + request.pathname + request.search});
                await route.fulfill({response});
            });
            await context.addInitScript(() => {
                window.originalLocalStorage = window.localStorage;
                window.testOpenedWindows = [];
                window.open = (...args) => { window.testOpenedWindows.push(args); return null; };
            });
            const page = await context.newPage(), errors = [], requests = [];
            page.on('pageerror', error => errors.push(error.message));
            page.on('request', request => requests.push(new URL(request.url()).pathname));
            await page.goto(url);
            await page.waitForFunction(() => window.game?._bootComplete, {}, {polling: 100});
            await page.locator('#loading-screen').waitFor({state: 'hidden'});
            for (let i = 0; i < 3; i++) await page.keyboard.press('Control+Backslash');
            const state = await page.evaluate(() => ({
                sandbox: CEParityTesting.active,
                originalStorage: window.localStorage === window.originalLocalStorage,
                menuNodes: document.querySelectorAll('#debug-console,#parity-tools-launcher,#parity-test-banner').length,
                toolGlobals: ['toggleDebugMode','debugGrantAllPickaxes','debugGrantAllFortunes','ParityCheckpointTests','PerformanceMonitor']
                    .filter(key => typeof window[key] !== 'undefined'),
                sandboxOpener: typeof CEParityTesting.openSandbox,
                openedWindows: window.testOpenedWindows.length,
                previewSaveKeys: Object.keys(sessionStorage).filter(key => key.startsWith('ce-parity-checkpoint-'))
            }));
            assert.deepEqual(state, {sandbox: false, originalStorage: true, menuNodes: 0, toolGlobals: [],
                sandboxOpener: 'undefined', openedWindows: 0, previewSaveKeys: []}, name);
            assert.equal(requests.some(path => /checkpoint-tools|checkpoint-scenarios|parity-testing\.js/.test(path)), false, name);
            assert.deepEqual(errors, [], name);
            rows.push({name, url, ...state, errors});
            await context.close();
        }
        const context = await browser.newContext();
        await context.route('**/*', route => route.request().url().startsWith('http://localhost:8011/') ? route.continue() : route.abort());
        const page = await context.newPage();
        await page.goto('http://localhost:8011/play/?parityTest=checkpoint-69');
        await page.waitForFunction(() => window.game?._bootComplete && !!document.getElementById('debug-console'), {}, {polling: 100});
        await page.locator('#loading-screen').waitFor({state: 'hidden'});
        assert.equal(await page.evaluate(() => CEParityTesting.active), true);
        await page.keyboard.press('Control+Backslash');
        assert.equal(await page.locator('#debug-console').count(), 0);
        await page.keyboard.press('Control+Backslash');
        assert.equal(await page.locator('#debug-console').count(), 1);
        rows.push({name: 'explicit-local-preview', sandbox: true, shortcutWorks: true});
        await context.close();
        fs.writeFileSync(output + '/production-debug-results.json', JSON.stringify({rows}, null, 2));
        console.log(JSON.stringify({passed: true, cases: rows.length}));
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
